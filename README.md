# Bid Hunter - Government Contract Portal

A comprehensive Next.js application for tracking and managing government bid opportunities across multiple portals.

![Bid Hunter Dashboard](./screenshot.png)

## 🚀 Features

### 📊 Today's Count Dashboard
- Real-time bid statistics and metrics
- Portal performance monitoring
- Category-wise bid distribution
- Auto-refreshing data with configurable intervals

### 📋 Hunted Data Management
- Comprehensive bid listing with search and filtering
- Export functionality (CSV format)
- Sortable columns and advanced filtering options
- Real-time data refresh capabilities

### 🔐 Credentials Management
- Secure portal credential storage
- Connection testing for each portal
- CRUD operations for portal management
- Password visibility controls for security

## 🛠 Tech Stack

- **Frontend**: Next.js 14+ with App Router
- **State Management**: React Context API + TanStack Query
- **Styling**: Tailwind CSS with custom design system
- **Type Safety**: TypeScript throughout
- **Icons**: Lucide React
- **Development**: ESLint, Hot Reload

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mikesalmon222222-sketch/BOT.git
   cd BOT
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🏗 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Main application page
│   ├── providers.tsx      # TanStack Query & Context providers
│   └── globals.css        # Global styles with CSS variables
├── components/
│   ├── layout/            # Layout components
│   │   ├── Sidebar.tsx    # Left navigation sidebar
│   │   └── MainContent.tsx # Main content area
│   ├── sections/          # Main application sections
│   │   ├── TodayCountSection.tsx    # Dashboard/statistics
│   │   ├── HuntedDataSection.tsx    # Bid data management
│   │   └── CredentialsSection.tsx   # Portal management
│   └── ui/                # Reusable UI components
│       ├── Button.tsx     # Button with variants
│       ├── Card.tsx       # Card components
│       ├── Input.tsx      # Form inputs
│       └── Badge.tsx      # Status badges
├── contexts/
│   └── AppContext.tsx     # Global state management
├── hooks/                 # Custom React hooks
│   ├── useBidData.ts      # Bid data operations
│   ├── usePortals.ts      # Portal CRUD operations
│   └── useTodayStats.ts   # Statistics with auto-refresh
├── lib/                   # Utilities and configurations
│   ├── utils.ts           # Utility functions
│   ├── mockData.ts        # Sample data for development
│   └── queryClient.ts     # TanStack Query configuration
└── types/
    └── index.ts           # TypeScript type definitions
```

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Check TypeScript types

## 🎨 Design System

The application uses a comprehensive design system built with Tailwind CSS:

- **Colors**: CSS variables for light/dark mode support
- **Typography**: System font stack with proper hierarchy
- **Components**: Consistent spacing, borders, and shadows
- **Responsive**: Mobile-first design approach

## 🔧 Configuration

### Environment Variables
The application uses mock data by default. To connect to real APIs, update the hook functions in `src/hooks/` to point to your actual endpoints.

### TanStack Query Configuration
Query client settings can be modified in `src/lib/queryClient.ts`:
- Cache time: 10 minutes
- Stale time: 5 minutes
- Auto-retry: 2 attempts

### Auto-refresh Settings
Statistics auto-refresh every 5 minutes by default. This can be configured in the context or per-component basis.

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Deploy automatically on every push

### Manual Deployment
1. Build the application:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm start
   ```

## 🔒 Security Considerations

- Passwords are handled securely with visibility toggles
- API calls use proper error handling
- No sensitive data is exposed in client-side code
- Production builds exclude development tools

## 🧪 Testing

The application includes:
- TypeScript type checking for compile-time safety
- ESLint for code quality
- Mock data for development and testing

## 📈 Performance Optimizations

- Query caching with TanStack Query
- Optimized re-renders with proper state management
- Code splitting with Next.js App Router
- Lazy loading where appropriate

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS