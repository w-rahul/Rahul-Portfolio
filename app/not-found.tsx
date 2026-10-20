export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[100svh] max-w-[680px] flex-col justify-center px-6">
      <p className="label">404 · not found <span className="jp normal-case">見つかりません</span></p>
      <h1 className="mt-3 font-serif text-[34px] italic leading-none text-fg">
        nothing here<span className="caret" aria-hidden />
      </h1>
      <a href="/" className="btn mt-8 w-fit">
        back home
      </a>
    </main>
  );
}
