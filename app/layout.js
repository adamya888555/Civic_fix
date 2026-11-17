export const metadata = { title: "Ticket system", description: "Solving every problem one at atime" };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f5f6f8", color: "#1a1a1a" }}>{children}</body>
    </html>
  );
}
