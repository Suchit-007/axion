# 🚀 Axion - Smart Maintenance Platform

## Real-time Incident Tracking & Prediction System

A comprehensive incident reporting and management platform designed for educational institutions and large campuses. Report maintenance issues in real-time, track their status, and benefit from AI-powered predictions and smart technician allocation.

### ✨ Features

- **🔐 User Authentication & Registration** - Secure login with role-based access (Student, Staff, Technician, Admin)
- **🚨 Real-time Incident Reporting with GPS** - Report issues with automatic location capture and image uploads
- **📊 Live Dashboard & Analytics** - Track incident statistics, resolution times, and system health
- **🗺️ Interactive Heatmap & Hotspots** - Visualize incident distribution across campus with heat maps
- **🤖 AI-Powered Incident Prediction** - Predict potential issues before they occur
- **👨‍💼 Smart Technician Allocation** - Automated scheduling with no overlapping assignments
- **⏰ SLA Monitoring & Notifications** - Real-time alerts and deadline tracking
- **🔍 Duplicate Detection** - Automatic detection of similar incidents within 100m radius
- **📱 Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices

### 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB Atlas with Mongoose
- **Authentication**: NextAuth.js 4 with JWT
- **Maps**: Leaflet.js, OpenStreetMap
- **UI Components**: Lucide React Icons
- **Notifications**: React Hot Toast
- **Forms**: React Hook Form

### 📋 Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB Atlas account
- NextAuth secret key (minimum 32 characters)

### 🚀 Quick Start

#### 1. Clone the repository

```bash
git clone https://github.com/yourusername/axion.git
cd axion
```

#### 2. Install dependencies

```bash
npm install
```

#### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-minimum-32-character-super-secret-key
```

#### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 📸 Screenshots

#### Dashboard Overview

![Dashboard](screenshots/screenshot-dashboard.png)
_Real-time statistics, incident summary, and system health monitoring_

#### Incident Reporting Form

![Report Incident](screenshots/screenshot-report.png)
_Smart form with auto-detection, location capture, and priority suggestion_

#### Live Heatmap

![Heatmap](screenshots/screenshot-map.png)
_Interactive visualization of incident hotspots across campus_

#### My Incidents

![My Incidents](screenshots/screenshot-incidents.png)
_Track and manage your reported incidents with real-time status updates_

#### Login Page

![Login](screenshots/screenshot-login.png)
_Secure authentication with role-based access control_

### 🎥 Demo Video

[Watch the full feature demo](assets/demo-video.mp4) - 2-3 minute walkthrough of all key features

### 📱 Application Structure

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # NextAuth routes
│   │   ├── incidents/         # Incident CRUD operations
│   │   └── incidents/duplicate/  # Duplicate detection
│   ├── dashboard/             # Dashboard page
│   ├── incidents/             # Incidents list page
│   ├── report/                # Report form page
│   ├── login/                 # Login page
│   ├── register/              # Registration page
│   ├── map/                   # Heatmap visualization
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Global styles
├── components/                # React components
│   └── AuthProvider.tsx       # Auth context provider
├── lib/
│   ├── auth.ts               # NextAuth configuration
│   ├── db.ts                 # MongoDB connection
│   └── heatmap.ts            # Heatmap utilities
├── models/                    # MongoDB schemas
│   ├── User.ts               # User model
│   └── Incident.ts           # Incident model
└── types/
    └── index.ts              # TypeScript types
```

### 🔐 Authentication Roles

- **Student/Staff**: Can report incidents and view their own reports
- **Technician**: Can view, update, and resolve assigned incidents
- **Admin**: Full access to all incidents and system management

### 📊 API Endpoints

#### Incidents

- `POST /api/incidents` - Create new incident
- `GET /api/incidents` - Get all incidents (paginated)
- `GET /api/incidents/[id]` - Get incident details
- `GET /api/incidents/user` - Get user's incidents
- `POST /api/incidents/duplicate` - Check for duplicate incidents
- `GET /api/incidents/map` - Get incidents for map visualization

#### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### 🎯 Incident Categories

- ⚡ Electricity
- 💧 Water
- 🌐 Internet
- 🏢 Hostel
- 🗑️ Garbage
- 💻 IT
- 🔧 Equipment

### 🔴 Priority Levels

- 🟢 Low - Minor issues, cosmetic problems
- 🟡 Medium - Standard issues, not urgent
- 🟠 High - Urgent issues, broken equipment
- 🔴 Critical - Emergency situations, safety hazards

### 🚀 Building for Production

```bash
npm run build
npm run start
```

### 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### 🧪 Testing

Test files are located in `src/tests/`:

- `api-tests.js` - API integration tests
- `mock-drills.js` - Comprehensive test scenarios
- `mock-incident-drills.ts` - TypeScript test suite

### 🐛 Known Issues & Limitations

- Image upload currently uses file names as placeholders (requires cloud storage integration)
- Heatmap visualization is static (can be enhanced with real-time updates)
- Technician allocation uses basic distance calculation (can be optimized with routing APIs)

### 🚀 Future Enhancements

- [ ] Cloud storage integration (AWS S3/Cloudinary)
- [ ] Real-time notifications via WebSockets
- [ ] Mobile app (React Native)
- [ ] Advanced reporting and analytics
- [ ] Integration with external maintenance systems
- [ ] Multi-language support
- [ ] Accessibility improvements

### 📄 Environment Variables

| Variable          | Description                               | Example                                          |
| ----------------- | ----------------------------------------- | ------------------------------------------------ |
| `MONGODB_URI`     | MongoDB Atlas connection string           | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `NEXTAUTH_URL`    | Application base URL                      | `http://localhost:3000`                          |
| `NEXTAUTH_SECRET` | Secret key for JWT signing (min 32 chars) | Generate with `openssl rand -base64 32`          |

### 🔒 Security Notes

- Never commit `.env.local` or environment files
- Always use strong, unique `NEXTAUTH_SECRET`
- Rotate secrets regularly in production
- Use HTTPS in production
- Keep dependencies updated
- Use strong MongoDB passwords with IP whitelist

### 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

### 👥 Authors

- Development Team - Initial work

### 📞 Support

For issues, questions, or suggestions, please open an issue on GitHub or contact the development team.

### 🙏 Acknowledgments

- Next.js and React communities
- MongoDB and NextAuth.js documentation
- OpenStreetMap contributors
- Tailwind CSS framework

---

**Built with ❤️ for better campus maintenance management**
