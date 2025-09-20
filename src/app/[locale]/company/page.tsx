"use client";

import { usePathname } from "next/navigation";
import { getTranslation, useLocale } from "@/lib/translations";

export default function CompanyPage() {
  const pathname = usePathname();
  const locale = useLocale(pathname);
  const t = getTranslation(locale);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">{t.company.title}</h1>
          <p className="text-xl">{t.company.subtitle}</p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-3xl font-bold mb-4 text-blue-600">{t.company.mission.title}</h2>
              <p className="text-gray-700 leading-relaxed">{t.company.mission.content}</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-3xl font-bold mb-4 text-blue-600">{t.company.vision.title}</h2>
              <p className="text-gray-700 leading-relaxed">{t.company.vision.content}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">{t.company.values.title}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t.company.values.innovation.title}</h3>
              <p className="text-gray-600">{t.company.values.innovation.description}</p>
            </div>
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t.company.values.trust.title}</h3>
              <p className="text-gray-600">{t.company.values.trust.description}</p>
            </div>
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t.company.values.growth.title}</h3>
              <p className="text-gray-600">{t.company.values.growth.description}</p>
            </div>
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-yellow-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t.company.values.quality.title}</h3>
              <p className="text-gray-600">{t.company.values.quality.description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* History Timeline */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">{t.company.history.title}</h2>
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-blue-200"></div>
              <div className="space-y-8">
                <div className="flex items-center">
                  <div className="flex-1 text-right pr-8">
                    <h3 className="text-xl font-semibold">{t.company.history.founded}</h3>
                  </div>
                  <div className="w-4 h-4 bg-blue-600 rounded-full relative z-10"></div>
                  <div className="flex-1 pl-8">
                    <p className="text-gray-600">{t.company.history.milestone1}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex-1 text-right pr-8">
                    <p className="text-gray-600">{t.company.history.milestone2}</p>
                  </div>
                  <div className="w-4 h-4 bg-blue-600 rounded-full relative z-10"></div>
                  <div className="flex-1 pl-8">
                    <h3 className="text-xl font-semibold">2025</h3>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex-1 text-right pr-8">
                    <h3 className="text-xl font-semibold">Future</h3>
                  </div>
                  <div className="w-4 h-4 bg-blue-600 rounded-full relative z-10"></div>
                  <div className="flex-1 pl-8">
                    <p className="text-gray-600">{t.company.history.milestone3}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">{t.company.team.title}</h2>
          <p className="text-center text-gray-600 mb-12">{t.company.team.description}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">50+</div>
              <div className="text-gray-600">{t.company.team.developers}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">20+</div>
              <div className="text-gray-600">{t.company.team.designers}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">30+</div>
              <div className="text-gray-600">{t.company.team.managers}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">100+</div>
              <div className="text-gray-600">{t.company.team.total}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">{t.company.contact.title}</h2>
          <p className="text-xl mb-8">{t.company.contact.subtitle}</p>
          <form className="max-w-2xl mx-auto bg-white rounded-lg p-8 text-gray-800">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder={t.company.contact.form.name}
                className="border border-gray-300 rounded px-4 py-2 w-full"
              />
              <input
                type="email"
                placeholder={t.company.contact.form.email}
                className="border border-gray-300 rounded px-4 py-2 w-full"
              />
            </div>
            <input
              type="text"
              placeholder={t.company.contact.form.company}
              className="border border-gray-300 rounded px-4 py-2 w-full mb-4"
            />
            <textarea
              placeholder={t.company.contact.form.message}
              rows={4}
              className="border border-gray-300 rounded px-4 py-2 w-full mb-4"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              {t.company.contact.form.submit}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}