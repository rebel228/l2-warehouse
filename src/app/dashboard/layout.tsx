import Header from '@/app/components/header/Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="w-full px-4 py-6">{children}</main>
    </>
  );
}
