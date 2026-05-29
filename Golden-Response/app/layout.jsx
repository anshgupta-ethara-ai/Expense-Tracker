import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Minimalist Expense Tracker',
  description: 'Track daily expenses and manage budgets smoothly.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
