# Team Management System - React & Tailwind CSS

A clean and modern team management system with login and team hierarchy visualization, built with React and Tailwind CSS.

## Features

- ✨ Clean and modern UI design
- 🎨 Beautiful gradient background with decorative elements
- 📱 Fully responsive design
- ⚡ Built with React and Vite for fast development
- 🎯 Styled with Tailwind CSS
- 🔐 Secure login with validation
- 👥 Interactive team hierarchy with dropdown structure
- 🌳 Multi-level organization tree view
- 📊 Team statistics dashboard

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── LoginForm.jsx       # Login form with authentication
│   │   └── TeamPage.jsx        # Team hierarchy visualization
│   ├── App.jsx                 # Root application with routing
│   ├── main.jsx                # Application entry point
│   └── index.css               # Global styles with Tailwind directives
├── index.html                  # HTML template
├── package.json                # Dependencies and scripts
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── postcss.config.js           # PostCSS configuration

```

## Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Usage

### Login Credentials

- **Email**: `alok@gmail.com`
- **Password**: `123`

### Features

#### Login Page (`/`)

- Email and password input fields
- Form validation with error messages
- "Keep me signed in" checkbox
- Beautiful gradient design with decorative elements
- Automatic redirect to team page on successful login

#### Team Hierarchy Page (`/team`)

- **Super User**: Alok Mishra
- **Four Teams**: Vantage, Pioneer-Luck, Pioneer-RPO, CSK
- **Interactive Dropdowns**: Click to expand/collapse teams and team leads
- **Multi-level Structure**:
  - L1: Super User
  - L2: Team Leads
  - L3: Senior Members
  - L4: Team Members
- **Statistics Dashboard**: Shows total count of teams, leads, and members
- **Logout Button**: Returns to login page

### Customization

#### Adding New Teams

Edit `src/components/TeamPage.jsx` and add to the `teamData.teams` array:

```javascript
{
  id: 'new-team',
  name: 'New Team Name',
  teamLeads: [
    {
      id: 'new-team-lead',
      name: 'Lead Name',
      level: 'L2',
      members: [
        { name: 'Member Name', level: 'L4' }
      ]
    }
  ]
}
```

#### Integrating with Backend

Update the login function in `LoginForm.jsx` to connect to your API:

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const response = await fetch("YOUR_API_ENDPOINT/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (data.success) {
      navigate("/team");
    } else {
      setError("Invalid credentials");
    }
  } catch (error) {
    setError("Login failed");
  }
};
```

## Build for Production

To create a production build:

```bash
npm run build
```

The optimized files will be in the `dist` directory.

## Technologies Used

- **React 18** - UI library
- **React Router DOM** - Client-side routing
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS transformations
- **Autoprefixer** - CSS vendor prefixing

## Design Credits

Design inspired by Freepik

## License

MIT
