# IndieOut - Outdoor Gear Marketplace

A modern, full-stack marketplace platform connecting outdoor enthusiasts with independent gear makers. Built with React, TypeScript, and Rails API.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/indieout.git
cd indieout

# Install dependencies
npm run install:all

# Set up environment variables
cp .env.example .env
cp client/.env.example client/.env

# Set up database
cd api
rails db:create db:migrate db:seed

# Start development servers
cd ..
npm run dev
```

Visit http://localhost:3000 to see the application.

## Features

- **For Shoppers**
  - Browse curated outdoor gear from independent makers
  - Advanced search and filtering by category, price, and brand
  - Secure checkout with guest or authenticated options
  - Order tracking and wishlist functionality
  - Product reviews and ratings

- **For Sellers**
  - Complete store management dashboard
  - Product listing with image management
  - Order fulfillment and tracking
  - Sales analytics and reporting
  - Inventory management

- **For Admins**
  - Category and taxonomy management
  - Store verification and approval
  - Banner and hero content management
  - User and role management
  - Platform analytics

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- React Router for navigation
- Axios for API communication
- Auto-generated TypeScript types from Rails

### Backend
- Ruby on Rails 7.1 (API mode)
- PostgreSQL database
- JWT authentication
- JSONAPI serializers
- Shrine for file uploads
- CORS enabled for frontend

### Infrastructure
- Docker support for containerization
- Kubernetes manifests for orchestration
- GitHub Actions for CI/CD
- Nginx for production serving

## Project Structure

```
/
├── api/                # Rails API backend
│   ├── app/           # Application code
│   ├── config/        # Configuration files
│   ├── db/            # Database files
│   └── spec/          # Tests
├── client/            # React frontend
│   ├── src/           # Source code
│   ├── public/        # Static assets
│   └── dist/          # Production build
├── scripts/           # Development scripts
├── k8s/              # Kubernetes manifests
└── docs/             # Documentation
```

## Development

### Commands

```bash
# Start both frontend and backend
npm run dev

# Generate TypeScript types from Rails
npm run generate:types

# Run tests
cd api && bundle exec rspec
cd client && npm test

# Build for production
npm run build
```

### Key Development Features

- **Type Safety**: Automated TypeScript generation from Rails serializers
- **Hot Reloading**: Both frontend and backend support hot reloading
- **Consistent API**: JSONAPI format for all endpoints
- **Authentication**: JWT-based with role-based access control

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy with Docker

```bash
# Build and start all services
docker-compose up -d

# Run migrations
docker-compose exec api rails db:migrate
```

### Environment Variables

Required environment variables are documented in:
- `.env.example` - Backend configuration
- `client/.env.example` - Frontend configuration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

- Documentation: [docs/](docs/)
- Issues: [GitHub Issues](https://github.com/yourusername/indieout/issues)
- Email: support@indieout.com