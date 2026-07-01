import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <Header />
      <main id="main-content" className="flex flex-1 flex-col focus:outline-none" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </>
  )
}
