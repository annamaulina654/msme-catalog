// K-8: semua halaman di bawah /admin tidak boleh diindeks mesin pencari.
export const metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function LayoutAdmin({ children }) {
  return children;
}
