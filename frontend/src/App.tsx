import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/student/Dashboard';
import SubmitProposal from './pages/student/SubmitProposal';
import CategoryQueue from './pages/category/Queue';
import BudgetQueue from './pages/budget/Queue';
import { useAuth } from './state/AuthContext';

function PrivateRoute({ children }: { children: JSX.Element }) {
	const { token } = useAuth();
	if (!token) return <Navigate to="/login" replace />;
	return children;
}

export default function App() {
	return (
		<div style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
			<nav style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
				<Link to="/">Home</Link>
				<Link to="/login">Login</Link>
				<Link to="/signup">Signup</Link>
				<Link to="/student">Student</Link>
				<Link to="/category">Category</Link>
				<Link to="/budget">Budget</Link>
			</nav>
			<Routes>
				<Route path="/" element={<Navigate to="/login" />} />
				<Route path="/login" element={<Login />} />
				<Route path="/signup" element={<Signup />} />
				<Route path="/student" element={<PrivateRoute><StudentDashboard /></PrivateRoute>} />
				<Route path="/student/submit" element={<PrivateRoute><SubmitProposal /></PrivateRoute>} />
				<Route path="/category" element={<PrivateRoute><CategoryQueue /></PrivateRoute>} />
				<Route path="/budget" element={<PrivateRoute><BudgetQueue /></PrivateRoute>} />
			</Routes>
		</div>
	);
}
