output "api_url" {
  description = "URL of the Cloud Run API service"
  value       = "https://indieout-api-${var.project_id}.a.run.app"
}

output "frontend_url" {
  description = "URL of the frontend (via Load Balancer)"
  value       = "https://${var.domains[0]}"
}

output "frontend_bucket" {
  description = "Name of the frontend storage bucket"
  value       = google_storage_bucket.frontend.name
}

output "database_connection_name" {
  description = "Cloud SQL connection name"
  value       = google_sql_database_instance.main.connection_name
}

output "artifact_registry" {
  description = "Artifact Registry repository URL"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.main.repository_id}"
}

output "service_account_email" {
  description = "Cloud Run service account email"
  value       = google_service_account.cloudrun.email
}

output "load_balancer_ip" {
  description = "Global IP address for the load balancer"
  value       = google_compute_global_forwarding_rule.frontend.ip_address
}