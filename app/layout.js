export const metadata = { title: "CivicFix - Report local issues", description: "Crowd-sourced civic issue tracker" };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f5f6f8", color: "#1a1a1a" }}>{children}</body>
    </html>
  );
}
