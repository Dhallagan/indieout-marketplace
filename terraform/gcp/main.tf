terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }
  
  backend "gcs" {
    bucket = "indieout-terraform-state"
    prefix = "terraform/state"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# Enable required APIs
resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "cloudbuild.googleapis.com",
    "artifactregistry.googleapis.com",
    "sqladmin.googleapis.com",
    "compute.googleapis.com",
    "secretmanager.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "iam.googleapis.com",
    "monitoring.googleapis.com",
    "logging.googleapis.com"
  ])
  
  service            = each.value
  disable_on_destroy = false
}

# Artifact Registry for Docker images
resource "google_artifact_registry_repository" "main" {
  location      = var.region
  repository_id = "indieout"
  description   = "Docker repository for IndieOut marketplace"
  format        = "DOCKER"
  
  cleanup_policies {
    id     = "keep-recent-versions"
    action = "KEEP"
    
    most_recent_versions {
      keep_count = 10
    }
  }
  
  depends_on = [google_project_service.apis]
}

# Cloud SQL instance
resource "google_sql_database_instance" "main" {
  name             = "indieout-db"
  database_version = "POSTGRES_15"
  region           = var.region
  
  settings {
    tier              = var.db_tier
    availability_type = var.environment == "production" ? "REGIONAL" : "ZONAL"
    
    disk_size       = 20
    disk_type       = "PD_SSD"
    disk_autoresize = true
    
    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"
      point_in_time_recovery_enabled = var.environment == "production"
      transaction_log_retention_days = var.environment == "production" ? 7 : 1
      
      backup_retention_settings {
        retained_backups = var.environment == "production" ? 30 : 7
        retention_unit   = "COUNT"
      }
    }
    
    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc.id
      
      require_ssl = true
    }
    
    database_flags {
      name  = "max_connections"
      value = "100"
    }
    
    insights_config {
      query_insights_enabled  = true
      query_string_length     = 1024
      record_application_tags = true
      record_client_address   = true
    }
    
    maintenance_window {
      day          = 7  # Sunday
      hour         = 4  # 4 AM
      update_track = "stable"
    }
  }
  
  deletion_protection = var.environment == "production"
  
  depends_on = [
    google_project_service.apis,
    google_service_networking_connection.private_vpc_connection
  ]
}

# Database
resource "google_sql_database" "main" {
  name     = "indieout_${var.environment}"
  instance = google_sql_database_instance.main.name
}

# Database user
resource "google_sql_user" "app" {
  name     = "indieout"
  instance = google_sql_database_instance.main.name
  password = random_password.db_password.result
}

# Random password for database
resource "random_password" "db_password" {
  length  = 32
  special = true
}

# VPC for private services
resource "google_compute_network" "vpc" {
  name                    = "indieout-vpc"
  auto_create_subnetworks = false
  
  depends_on = [google_project_service.apis]
}

# Subnet for Cloud Run
resource "google_compute_subnetwork" "cloudrun" {
  name          = "cloudrun-subnet"
  ip_cidr_range = "10.0.1.0/24"
  region        = var.region
  network       = google_compute_network.vpc.id
  
  private_ip_google_access = true
}

# Private service connection for Cloud SQL
resource "google_compute_global_address" "private_ip_address" {
  name          = "private-ip-address"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc.id
  
  depends_on = [google_project_service.apis]
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]
  
  depends_on = [google_project_service.apis]
}

# Service account for Cloud Run
resource "google_service_account" "cloudrun" {
  account_id   = "cloudrun-sa"
  display_name = "Cloud Run Service Account"
}

# IAM roles for Cloud Run service account
resource "google_project_iam_member" "cloudrun_roles" {
  for_each = toset([
    "roles/cloudsql.client",
    "roles/secretmanager.secretAccessor",
    "roles/storage.objectViewer",
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter"
  ])
  
  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.cloudrun.email}"
}

# Secret Manager secrets
resource "google_secret_manager_secret" "secrets" {
  for_each = {
    database-url      = "Database connection string"
    rails-master-key  = "Rails master key"
    jwt-secret-key    = "JWT secret key"
    smtp-password     = "SMTP password"
    stripe-secret-key = "Stripe secret key"
  }
  
  secret_id = each.key
  
  replication {
    auto {}
  }
  
  depends_on = [google_project_service.apis]
}

# Database URL secret version
resource "google_secret_manager_secret_version" "database_url" {
  secret = google_secret_manager_secret.secrets["database-url"].id
  
  secret_data = "postgresql://${google_sql_user.app.name}:${random_password.db_password.result}@localhost/indieout_${var.environment}?host=/cloudsql/${google_sql_database_instance.main.connection_name}"
}

# Cloud Storage bucket for frontend
resource "google_storage_bucket" "frontend" {
  name          = "indieout-frontend-${var.project_id}"
  location      = var.region
  force_destroy = var.environment != "production"
  
  uniform_bucket_level_access = true
  
  website {
    main_page_suffix = "index.html"
    not_found_page   = "index.html"  # For SPA routing
  }
  
  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
  
  lifecycle_rule {
    condition {
      num_newer_versions = 3
    }
    action {
      type = "Delete"
    }
  }
  
  depends_on = [google_project_service.apis]
}

# Make frontend bucket public
resource "google_storage_bucket_iam_member" "frontend_public" {
  bucket = google_storage_bucket.frontend.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

# Backend bucket for CDN
resource "google_compute_backend_bucket" "frontend" {
  name        = "indieout-frontend-backend"
  bucket_name = google_storage_bucket.frontend.name
  enable_cdn  = true
  
  cdn_policy {
    cache_mode        = "CACHE_ALL_STATIC"
    client_ttl        = 3600
    default_ttl       = 3600
    max_ttl           = 86400
    negative_caching  = true
    serve_while_stale = 86400
    
    cache_key_policy {
      include_host         = true
      include_protocol     = true
      include_query_string = false
    }
  }
  
  depends_on = [google_project_service.apis]
}

# SSL certificate (managed by Google)
resource "google_compute_managed_ssl_certificate" "frontend" {
  name = "indieout-ssl-cert"
  
  managed {
    domains = var.domains
  }
  
  depends_on = [google_project_service.apis]
}

# URL map for load balancer
resource "google_compute_url_map" "frontend" {
  name            = "indieout-frontend-lb"
  default_service = google_compute_backend_bucket.frontend.id
  
  depends_on = [google_project_service.apis]
}

# HTTPS proxy
resource "google_compute_target_https_proxy" "frontend" {
  name             = "indieout-frontend-https-proxy"
  url_map          = google_compute_url_map.frontend.id
  ssl_certificates = [google_compute_managed_ssl_certificate.frontend.id]
  
  depends_on = [google_project_service.apis]
}

# Global forwarding rule
resource "google_compute_global_forwarding_rule" "frontend" {
  name       = "indieout-frontend-https-rule"
  target     = google_compute_target_https_proxy.frontend.id
  port_range = "443"
  
  depends_on = [google_project_service.apis]
}

# Cloud Build trigger for main branch
resource "google_cloudbuild_trigger" "main" {
  name        = "deploy-main"
  description = "Deploy to production on push to main"
  
  github {
    owner = var.github_owner
    name  = var.github_repo
    
    push {
      branch = "^main$"
    }
  }
  
  filename = "cloudbuild.yaml"
  
  substitutions = {
    _ENVIRONMENT = "production"
  }
  
  depends_on = [google_project_service.apis]
}

# Cloud Build trigger for pull requests
resource "google_cloudbuild_trigger" "pr" {
  name        = "test-pr"
  description = "Run tests on pull requests"
  
  github {
    owner = var.github_owner
    name  = var.github_repo
    
    pull_request {
      branch = "^main$"
    }
  }
  
  filename = "cloudbuild-pr.yaml"
  
  depends_on = [google_project_service.apis]
}

# Monitoring dashboard
resource "google_monitoring_dashboard" "main" {
  dashboard_json = jsonencode({
    displayName = "IndieOut Marketplace"
    gridLayout = {
      widgets = [
        {
          title = "Cloud Run Request Count"
          xyChart = {
            dataSets = [{
              timeSeriesQuery = {
                timeSeriesFilter = {
                  filter = "metric.type=\"run.googleapis.com/request_count\" resource.type=\"cloud_run_revision\""
                }
              }
            }]
          }
        },
        {
          title = "Cloud SQL CPU Utilization"
          xyChart = {
            dataSets = [{
              timeSeriesQuery = {
                timeSeriesFilter = {
                  filter = "metric.type=\"cloudsql.googleapis.com/database/cpu/utilization\" resource.type=\"cloudsql_database\""
                }
              }
            }]
          }
        }
      ]
    }
  })
  
  depends_on = [google_project_service.apis]
}

# Uptime checks
resource "google_monitoring_uptime_check_config" "api" {
  display_name = "API Health Check"
  timeout      = "10s"
  period       = "60s"
  
  http_check {
    path         = "/health"
    port         = "443"
    use_ssl      = true
    validate_ssl = true
  }
  
  monitored_resource {
    type = "uptime_url"
    labels = {
      project_id = var.project_id
      host       = "api-${var.project_id}.a.run.app"
    }
  }
  
  depends_on = [google_project_service.apis]
}

# Alerting policy
resource "google_monitoring_alert_policy" "high_error_rate" {
  display_name = "High Error Rate"
  combiner     = "OR"
  
  conditions {
    display_name = "Error rate above 1%"
    
    condition_threshold {
      filter          = "metric.type=\"run.googleapis.com/request_count\" AND metric.label.response_code_class!=\"2xx\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0.01
      
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_RATE"
      }
    }
  }
  
  notification_channels = var.notification_channels
  
  documentation {
    content = "The error rate for Cloud Run service has exceeded 1%."
  }
  
  depends_on = [google_project_service.apis]
}