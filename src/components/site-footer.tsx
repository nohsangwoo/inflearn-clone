"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getTranslation, useLocale } from "@/lib/translations";
import { Phone, Mail, MapPin, Clock, Youtube, Twitter } from "lucide-react";

export function SiteFooter() {
  const pathname = usePathname();
  const locale = useLocale(pathname);
  const t = getTranslation(locale).footer;

  const getLocalePath = (path: string) => {
    if (locale === 'ko') {
      return path;
    }
    return `/${locale}${path}`;
  };

  return (
    <footer className="border-t mt-10 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t.company}</h3>
            <p className="text-sm text-muted-foreground">
              {t.description}
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://www.youtube.com/@bknil"
                target="_blank"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </Link>
              <Link
                href="https://x.com/bknil_offitial"
                target="_blank"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t.quickLinks}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={getLocalePath("/")}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t.home}
                </Link>
              </li>
              <li>
                <Link
                  href={getLocalePath("/courses")}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t.courses}
                </Link>
              </li>
              <li>
                <Link
                  href={getLocalePath("/roadmaps")}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t.roadmap}
                </Link>
              </li>
              <li>
                <Link
                  href={getLocalePath("/company")}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t.company_info}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t.services}</h3>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground">{t.lms}</li>
              <li className="text-sm text-muted-foreground">{t.outsourcing}</li>
              <li className="text-sm text-muted-foreground">{t.consulting}</li>
              <li className="text-sm text-muted-foreground">{t.development}</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t.contact}</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">{t.phone}</p>
                  <p className="text-sm">02-931-9310</p>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">{t.email}</p>
                  <Link
                    href="mailto:milli@molluhub.com"
                    className="text-sm hover:text-primary transition-colors"
                  >
                    milli@molluhub.com
                  </Link>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">{t.address}</p>
                  <p className="text-sm">{t.addressDetail}</p>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">{t.businessHours}</p>
                  <p className="text-sm">{t.businessHoursDetail}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              <p>{t.businessNumber}</p>
              <p>{t.copyright}</p>
            </div>
            <div className="flex space-x-6">
              <Link
                href={getLocalePath("/privacy")}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {t.privacy}
              </Link>
              <Link
                href={getLocalePath("/terms")}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {t.terms}
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {t.businessLicense}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}