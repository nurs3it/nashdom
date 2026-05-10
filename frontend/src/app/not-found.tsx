import Link from 'next/link';
import { ArrowLeft, Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/widgets/header/header';
import { Footer } from '@/widgets/footer/footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="relative isolate overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-br from-terra-100 via-sand-100 to-ochre-300/30 dark:from-sand-850 dark:via-sand-900 dark:to-sand-850"
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,theme(colors.terra-300)_1px,transparent_0)] [background-size:28px_28px] dark:opacity-15"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 right-[-10%] h-[420px] w-[420px] rounded-full bg-ochre-300/40 blur-3xl dark:bg-terra-500/20"
          />

          <div className="container relative pt-20 pb-24 lg:pt-28 lg:pb-32 text-center">
            <p className="font-display text-[120px] sm:text-[180px] font-semibold leading-none tracking-[-0.04em] bg-gradient-to-r from-terra-500 via-terra-600 to-ochre-500 bg-clip-text text-transparent dark:from-terra-300 dark:via-terra-400 dark:to-ochre-300">
              404
            </p>
            <h1 className="font-display mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
              Страница не нашлась
            </h1>
            <p className="mt-3 text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
              Возможно, ссылка устарела или объявление сняли с публикации.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/">
                  <Home className="h-4 w-4" strokeWidth={1.75} />
                  На главную
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/properties">
                  <Search className="h-4 w-4" strokeWidth={1.75} />
                  Открыть каталог
                </Link>
              </Button>
            </div>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
              Вернуться назад
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
