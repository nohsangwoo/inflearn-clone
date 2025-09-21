'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  Shield,
  Lock,
  FileText,
  Users,
  AlertCircle,
  Mail,
  Phone,
  User,
  ChevronRight,
} from 'lucide-react'

export default function Privacy() {
  const sections = [
    {
      id: 'collection',
      number: '01',
      title: '개인정보 수집 항목 및 방법',
      icon: <FileText className="w-5 h-5" />,
      content: [
        {
          subtitle: '수집 항목',
          items: [
            {
              label: '필수 항목',
              text: '이름, 이메일 주소, 비밀번호, 휴대전화번호, 생년월일',
            },
            {
              label: '선택 항목',
              text: '프로필 사진, 관심 분야, 학습 목표, 직업, 학력',
            },
            {
              label: '자동 수집',
              text: '접속 로그, 쿠키, IP 주소, 기기정보, 학습 이력, 결제 내역',
            },
          ],
        },
        {
          subtitle: '수집 방법',
          items: [
            { text: '회원가입 및 서비스 이용 시 사용자 입력을 통한 직접 수집' },
            { text: '고객센터 상담, 이메일, 전화 문의 과정에서 수집' },
            { text: '자동화된 수집 도구(쿠키, 로그 분석) 사용' },
          ],
        },
      ],
    },
    {
      id: 'purpose',
      number: '02',
      title: '개인정보의 수집 및 이용 목적',
      icon: <Users className="w-5 h-5" />,
      content: [
        {
          items: [
            { text: '서비스 회원 가입 및 본인 확인, 계정 관리' },
            {
              text: '거래 요청서 등록, 견적서 송신·수신 등 플랫폼 핵심 기능 제공',
            },
            { text: '서비스 공지사항 및 고객 지원 대응' },
            { text: '부정 이용 방지, 법령상 의무 준수' },
            { text: '맞춤형 서비스 제공 및 서비스 개선·분석을 위한 통계 활용' },
            { text: '거래 관련 결제 처리 및 정산 업무' },
          ],
        },
      ],
    },
    {
      id: 'retention',
      number: '03',
      title: '개인정보의 보유 및 이용 기간',
      icon: <Lock className="w-5 h-5" />,
      content: [
        {
          items: [
            { text: '회원 탈퇴 시 즉시 파기를 원칙으로 함' },
            {
              text: '단, 관계법령에 따라 일정 기간 보관이 필요한 경우에는 해당 법령에서 정한 기간 동안 보관',
            },
          ],
        },
        {
          subtitle: '법령에 따른 보관 기간',
          items: [
            { label: '계약·거래 내역', text: '5년' },
            { label: '결제·정산 기록', text: '5년' },
            { label: '전자상거래 분쟁 해결 기록', text: '3년' },
            { label: '로그 기록', text: '6개월' },
          ],
        },
      ],
    },
    {
      id: 'provision',
      number: '04',
      title: '개인정보 제3자 제공 및 위탁',
      icon: <Shield className="w-5 h-5" />,
      content: [
        {
          items: [
            {
              text: '링구스트는 원칙적으로 이용자의 사전 동의 없이는 개인정보를 제3자에게 제공하지 않습니다.',
            },
            {
              text: '서비스 운영 및 고객 지원을 위해 일부 업무를 외부 전문업체에 위탁할 수 있으며, 위탁 시 개인정보 보호 관련 법규를 준수하고 관리·감독을 철저히 합니다.',
            },
          ],
        },
      ],
    },
    {
      id: 'destruction',
      number: '05',
      title: '개인정보의 파기 절차 및 방법',
      icon: <AlertCircle className="w-5 h-5" />,
      content: [
        {
          items: [
            {
              text: '개인정보 보유 기간이 종료되거나 처리 목적이 달성된 경우 지체 없이 파기합니다.',
            },
          ],
        },
        {
          subtitle: '파기 방법',
          items: [
            {
              label: '전자적 파일 형태',
              text: '복구가 불가능한 방법으로 영구 삭제',
            },
            { label: '종이 문서 형태', text: '분쇄 또는 소각을 통한 파기' },
          ],
        },
      ],
    },
    {
      id: 'rights',
      number: '06',
      title: '이용자의 권리와 행사 방법',
      icon: <User className="w-5 h-5" />,
      content: [
        {
          items: [
            {
              text: '이용자는 언제든지 자신의 개인정보를 조회·수정·삭제·처리정지를 요청할 수 있습니다.',
            },
            {
              text: '회원 탈퇴를 요청할 경우, 법령상 보관 의무가 없는 범위 내에서 즉시 삭제됩니다.',
            },
            {
              text: '고객센터를 통해 개인정보 처리와 관련한 불만이나 문의사항을 접수하실 수 있습니다.',
            },
          ],
        },
      ],
    },
    {
      id: 'security',
      number: '07',
      title: '개인정보 보호를 위한 기술적·관리적 조치',
      icon: <Lock className="w-5 h-5" />,
      content: [
        {
          subtitle:
            '개인정보를 안전하게 처리하기 위해 다음과 같은 조치를 시행합니다.',
          items: [
            { text: '데이터 암호화 및 접근 권한 최소화' },
            { text: '보안 프로그램 설치 및 주기적 업데이트' },
            { text: '개인정보 취급 직원의 교육 및 관리 감독 강화' },
            { text: '침해사고 발생 시 신속 대응 및 피해 최소화 절차 마련' },
          ],
        },
      ],
    },
    {
      id: 'disclaimer',
      number: '08',
      title: '환불 및 분쟁 처리에 대한 책임 한계',
      icon: <AlertCircle className="w-5 h-5" />,
      content: [
        {
          items: [
            {
              text: '링구스트는 강사와 수강생 간 교육 서비스를 중개하는 플랫폼으로, 강의 내용의 정확성, 품질, 학습 효과 등에 대한 직접적인 책임을 지지 않습니다.',
            },
            {
              text: '환불 등 모든 사후 처리는 플랫폼 정책에 따라 처리되며, 링구스트는 중재 역할을 수행할 수 있습니다.',
            },
            {
              text: '학습 과정에서 발생하는 분쟁, 손해배상 청구, 법적 문제는 전적으로 강사와 수강생 간의 책임으로 한정되며, 링구스트는 분쟁 해결에 대한 법적 의무를 부담하지 않습니다.',
            },
            {
              text: '단, 플랫폼 이용약관 위반, 불법 콘텐츠, 악용 사례에 한해 링구스트는 자체적인 판단으로 계정 제한 또는 제재 조치를 취할 수 있습니다.',
            },
          ],
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 to-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
              <Shield className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              개인정보 처리방침
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              링구스트(Lingoost)는 이용자의 개인정보를 소중히 보호하며, 관련
              법령을 준수합니다.
            </p>
            <div className="mt-6 inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm">
              <span className="text-sm text-gray-500">시행일자</span>
              <span className="ml-2 text-sm font-semibold text-gray-900">
                2025년 9월 21일
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="bg-gray-50 py-8 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
            {sections.map(section => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex-shrink-0 px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors whitespace-nowrap"
              >
                {section.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-32">
              <nav className="space-y-1">
                {sections.map(section => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-colors group"
                  >
                    <span className="mr-3 text-orange-500 font-bold">
                      {section.number}
                    </span>
                    <span className="flex-1 text-gray-700 group-hover:text-orange-600">
                      {section.title}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-orange-600" />
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-2 space-y-12">
            {sections.map(section => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-32"
              >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg">
                        {section.icon}
                      </div>
                      <div>
                        <span className="text-white/80 text-sm">
                          {section.number}
                        </span>
                        <h2 className="text-xl font-bold text-white">
                          {section.title}
                        </h2>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {section.content.map((contentBlock, idx) => (
                      <div key={idx} className="space-y-4">
                        {contentBlock.subtitle && (
                          <h3 className="font-semibold text-gray-900 flex items-center">
                            <span className="w-1 h-5 bg-orange-500 rounded-full mr-3" />
                            {contentBlock.subtitle}
                          </h3>
                        )}
                        <ul className="space-y-3">
                          {contentBlock.items?.map((item, itemIdx) => (
                            <li key={itemIdx} className="flex items-start">
                              <span className="flex-shrink-0 w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3" />
                              <div className="flex-1">
                                {'label' in item && item.label && (
                                  <span className="font-medium text-gray-900 mr-2">
                                    {item.label}:
                                  </span>
                                )}
                                <span className="text-gray-600">
                                  {item.text}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ))}

            {/* Contact Section */}
            <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-6">
                개인정보 보호책임자 및 문의처
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-lg">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">책임자</p>
                      <p className="font-semibold">개인정보보호책임자</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-lg">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">연락처</p>
                      <p className="font-semibold">02-931-9310</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-lg">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">문의 접수</p>
                      <p className="font-semibold">
                        고객센터 또는 이메일을 통한 1:1 문의
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Notice */}
            <div className="bg-orange-50 border-l-4 border-orange-400 p-6 rounded-lg">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-orange-900">
                    고지 의무
                  </h3>
                  <p className="mt-2 text-orange-700">
                    본 개인정보 처리방침의 내용이 변경될 경우, 변경 사항을 시행
                    7일 전 플랫폼 공지사항을 통해 안내합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center space-y-4">
            <Image
              src="/logo.png"
              alt="Lingoost Logo"
              width={150}
              height={50}
              className="h-10 w-auto opacity-50"
            />
            <p className="text-sm">
              © 2025 주식회사 럿지. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
