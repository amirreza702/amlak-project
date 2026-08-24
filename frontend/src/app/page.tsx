const properties = [
  {
    id: 1,
    title: "آپارتمان نوساز در شاهرود",
    location: "خیابان فروغی",
    type: "آپارتمان",
    area: 120,
    bedrooms: 2,
    price: "۴٬۸۰۰٬۰۰۰٬۰۰۰",
    image: "/images/property-1.jpg",
  },
  {
    id: 2,
    title: "آپارتمان دو خوابه",
    location: "شهرک فرهنگیان",
    type: "آپارتمان",
    area: 95,
    bedrooms: 2,
    price: "۳٬۹۵۰٬۰۰۰٬۰۰۰",
    image: "/images/property-2.jpg",
  },
  {
    id: 3,
    title: "زمین مسکونی",
    location: "شاهرود",
    type: "زمین",
    area: 300,
    bedrooms: 0,
    price: "۲٬۷۰۰٬۰۰۰٬۰۰۰",
    image: "/images/property-3.jpg",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">

      {/* Header */}
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div className="text-2xl font-bold tracking-tight">
            ملکینو
          </div>

          <nav className="hidden gap-8 md:flex">
            <a href="#">خرید</a>
            <a href="#">اجاره</a>
            <a href="#">مشاوران</a>
            <a href="#">ثبت ملک</a>
          </nav>

          <button className="rounded-full border border-stone-300 px-5 py-2">
            ورود
          </button>

        </div>
      </header>


      {/* Hero */}
      <section className="bg-stone-100">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center">

          <p className="mb-4 text-sm font-medium text-stone-500">
            شاهرود، استان سمنان
          </p>

          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            ملک بعدی خود را
            <br />
            پیدا کنید
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-stone-600">
            جست‌وجوی خانه، آپارتمان، ویلا و زمین
            در شاهرود
          </p>


          {/* Search */}
          <div className="mx-auto mt-10 max-w-4xl rounded-2xl bg-white p-3 shadow-lg">

            <div className="grid gap-3 md:grid-cols-[150px_1fr_140px]">

              <select className="rounded-xl bg-stone-100 px-4 py-4 outline-none">
                <option>خرید</option>
                <option>اجاره</option>
              </select>

              <input
                type="text"
                placeholder="محله، خیابان یا منطقه در شاهرود"
                className="rounded-xl bg-stone-100 px-4 py-4 outline-none"
              />

              <button className="rounded-xl bg-stone-900 px-6 py-4 font-medium text-white">
                جستجو
              </button>

            </div>
          </div>


          {/* Categories */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">

            {["آپارتمان", "خانه", "ویلا", "زمین"].map(
              (category) => (
                <button
                  key={category}
                  className="rounded-full border border-stone-300 bg-white px-6 py-3 text-sm hover:bg-stone-900 hover:text-white"
                >
                  {category}
                </button>
              )
            )}

          </div>

        </div>
      </section>


      {/* Properties */}
      <section className="mx-auto max-w-7xl px-6 py-20">

        <div className="mb-10 flex items-end justify-between">

          <div>
            <p className="text-sm text-stone-500">
              پیشنهادهای امروز
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              ملک‌های منتخب شاهرود
            </h2>
          </div>

          <button className="text-sm font-medium">
            مشاهده همه ←
          </button>

        </div>


        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {properties.map((property) => (

            <article
              key={property.id}
              className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >

              <div className="aspect-[4/3] bg-stone-200">
                <img
                  src={property.image}
                  alt={property.title}
                  className="h-full w-full object-cover"
                />
              </div>


              <div className="p-5">

                <div className="mb-3 flex items-center justify-between">

                  <span className="rounded-full bg-stone-100 px-3 py-1 text-xs">
                    {property.type}
                  </span>

                  <button className="text-xl">
                    ♡
                  </button>

                </div>


                <h3 className="text-lg font-semibold">
                  {property.title}
                </h3>

                <p className="mt-2 text-sm text-stone-500">
                  {property.location}
                </p>


                <div className="mt-4 flex gap-4 text-sm text-stone-600">
                  <span>{property.area} متر</span>

                  {property.bedrooms > 0 && (
                    <span>{property.bedrooms} خواب</span>
                  )}
                </div>


                <div className="mt-5 border-t border-stone-100 pt-4">

                  <p className="text-xs text-stone-500">
                    قیمت
                  </p>

                  <p className="mt-1 text-lg font-bold">
                    {property.price}
                    <span className="mr-1 text-xs font-normal">
                      تومان
                    </span>
                  </p>

                </div>

              </div>

            </article>

          ))}

        </div>

      </section>

    </main>
  );
}