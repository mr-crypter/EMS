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

function RoleRoute({ children, allowedRoles }: { children: JSX.Element; allowedRoles: string[] }) {
	const { token, role } = useAuth();
	if (!token) return <Navigate to="/login" replace />;
	if (!allowedRoles.includes(role || '')) return <Navigate to="/" replace />;
	return children;
}

export default function App() {
	const { token, role, logout } = useAuth();
	const isStudent = role === 'student';
	const isCategoryReviewer = role === 'category_reviewer';
	const isBudgetReviewer = role === 'budget_reviewer';
	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white border-b">
				<div className="container mx-auto px-4 py-3 flex items-center justify-between">
					<Link to="/" className="text-lg font-semibold text-gray-900">EMS</Link>
					<nav className="flex items-center gap-4 text-sm">
						{!token && (
							<>
								<Link className="text-gray-600 hover:text-gray-900" to="/login">Login</Link>
								<Link className="text-gray-600 hover:text-gray-900" to="/signup">Signup</Link>
							</>
						)}
						{isStudent && (
							<>
								<Link className="text-gray-600 hover:text-gray-900" to="/student">My Proposals</Link>
								<Link className="text-gray-600 hover:text-gray-900" to="/student/submit">Submit Proposal</Link>
							</>
						)}
						{isCategoryReviewer && (
							<Link className="text-gray-600 hover:text-gray-900" to="/category">Category Review</Link>
						)}
						{isBudgetReviewer && (
							<Link className="text-gray-600 hover:text-gray-900" to="/budget">Budget Review</Link>
						)}
						{token && (
							<button onClick={logout} className="ml-2 inline-flex items-center rounded-md bg-gray-100 px-3 py-1.5 text-gray-700 hover:bg-gray-200">Logout{role ? ` (${role})` : ''}</button>
						)}
					</nav>
				</div>
			</header>
			<main className="container mx-auto px-4 py-6">
				<Routes>
                    <Route path="/" element={
                        token
                            ? <Navigate to={role === 'category_reviewer' ? '/category' : role === 'budget_reviewer' ? '/budget' : '/student'} />
                            : <Navigate to="/login" />
                    } />
					<Route path="/login" element={<Login />} />
					<Route path="/signup" element={<Signup />} />
					<Route path="/student" element={<RoleRoute allowedRoles={['student']}><StudentDashboard /></RoleRoute>} />
					<Route path="/student/submit" element={<RoleRoute allowedRoles={['student']}><SubmitProposal /></RoleRoute>} />
					<Route path="/category" element={<RoleRoute allowedRoles={['category_reviewer']}><CategoryQueue /></RoleRoute>} />
					<Route path="/budget" element={<RoleRoute allowedRoles={['budget_reviewer']}><BudgetQueue /></RoleRoute>} />
				</Routes>
			</main>
		</div>
	);
}
