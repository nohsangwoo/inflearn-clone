'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  FileText, Shield, Users, AlertCircle, Scale, ChevronRight,
  Building2, UserCheck, Briefcase, Ban, Settings, LogOut,
  Edit, Gavel, CheckCircle, Info, ScrollText, HandshakeIcon,
  ShieldCheck, AlertTriangle, BookOpen, CircleDot
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export default function TermPage() {
  const [activeSection, setActiveSection] = useState<string>('0')

  interface TermContent {
    subtitle: string
    description: string
    highlight?: boolean
    warning?: boolean
  }

  interface TermSection {
    id: string
    title: string
    icon: React.ReactNode
    summary: string
    color: string
    content: TermContent[]
  }

  const termsData: TermSection[] = [
    {
      id: '0',
      title: '총칙',
      icon: <BookOpen className="h-5 w-5" />,
      summary: '플랫폼 운영 및 책임 범위',
      color: 'blue',
      content: [
        {
          subtitle: '약관의 목적',
          description: '본 약관은 주식회사 럿지(이하 "회사")가 운영하는 온라인 교육 플랫폼 Lingoost(링구스트)의 회원가입, 서비스 이용, 권리·의무, 책임 사항에 관한 내용을 규정합니다.'
        },
        {
          subtitle: '회사의 역할',
          description: '회사는 온라인 교육 콘텐츠 중개 플랫폼을 제공하며, 강의 콘텐츠의 제작 및 판매는 강사 회원과 수강생 회원 간에 이루어집니다.'
        },
        {
          subtitle: '책임 제한',
          description: '회사는 고의 또는 중대한 과실이 없는 한 강의 내용의 정확성, 완전성, 유용성에 대해 보증하지 않으며, 학습 과정에서 발생하는 손해에 대해 책임지지 않습니다.',
          highlight: true
        }
      ]
    },
    {
      id: '1',
      title: '회원가입',
      icon: <UserCheck className="h-5 w-5" />,
      summary: '가입 절차 및 자격 요건',
      color: 'green',
      content: [
        {
          subtitle: '가입 절차',
          description: '회원가입은 플랫폼 내 가입 양식을 작성하고, 본 약관 및 개인정보 처리방침에 동의함으로써 성립합니다.'
        },
        {
          subtitle: '정보 제공 의무',
          description: '회원은 본인의 실명 및 정확한 정보를 제공해야 하며, 허위정보 제공으로 인한 책임은 회원 본인에게 있습니다.'
        },
        {
          subtitle: '가입 제한',
          description: '미성년자, 법률상 거래가 제한된 자는 회원가입이 제한됩니다.',
          warning: true
        },
        {
          subtitle: '강사 회원',
          description: '강사로 활동하려는 회원은 필요시 관련 자격 증명 서류 및 포트폴리오를 제출해야 합니다.'
        }
      ]
    },
    {
      id: '2',
      title: '회원의 의무',
      icon: <Users className="h-5 w-5" />,
      summary: '회원이 준수해야 할 사항',
      color: 'orange',
      content: [
        {
          subtitle: '법령 준수',
          description: '회원은 본 약관 및 관계 법령을 준수해야 하며, 타인의 권리를 침해하거나 불법적인 목적에 플랫폼을 이용할 수 없습니다.'
        },
        {
          subtitle: '책임 귀속',
          description: '플랫폼 내에서 발생하는 모든 행위는 해당 계정 소유자에게 책임이 귀속됩니다.',
          highlight: true
        },
        {
          subtitle: '계정 관리',
          description: '회원은 계정 정보(아이디, 비밀번호)를 제3자에게 양도하거나 공유할 수 없습니다.'
        }
      ]
    },
    {
      id: '3',
      title: '회사의 의무',
      icon: <Building2 className="h-5 w-5" />,
      summary: '플랫폼 운영자의 책임',
      color: 'purple',
      content: [
        {
          subtitle: '서비스 제공',
          description: '회사는 회원이 안전하고 원활하게 서비스를 이용할 수 있도록 최선을 다합니다.'
        },
        {
          subtitle: '중개자 역할',
          description: '회사는 온라인 교육 콘텐츠 중개자로서 강의 내용의 정확성, 강사의 자격, 학습 효과 등에 대해 직접 책임지지 않으며, 회원 간 분쟁 조정 및 안내 역할만 수행합니다.',
          warning: true
        }
      ]
    },
    {
      id: '4',
      title: '서비스 이용',
      icon: <Briefcase className="h-5 w-5" />,
      summary: '제공되는 서비스 내용',
      color: 'cyan',
      content: [
        {
          subtitle: '서비스 범위',
          description: '회원은 링구스트(Lingoost)을 통해 온라인 강의 수강, 강의 제작 및 판매, 학습 진도 관리 서비스를 이용할 수 있습니다.'
        },
        {
          subtitle: '세부 규정',
          description: '서비스의 구체적 내용, 수수료, 환불·취소 규정은 별도의 "환불·취소·보상 정책" 및 안내 페이지를 따릅니다.'
        },
        {
          subtitle: '서비스 변경',
          description: '회사는 서비스 품질 향상을 위해 필요 시 기능을 추가·변경·중단할 수 있으며, 이에 대해 회원에게 사전 고지합니다.'
        }
      ]
    },
    {
      id: '5',
      title: '책임 제한',
      icon: <Shield className="h-5 w-5" />,
      summary: '회사의 면책 사항',
      color: 'red',
      content: [
        {
          subtitle: '거래 당사자',
          description: '회사는 플랫폼 제공자로서 거래 당사자가 아니며, 강의의 품질, 정확성, 완전성 등에 대한 최종 책임은 판매자 또는 구매자에게 있습니다.',
          highlight: true
        },
        {
          subtitle: '면책 사유',
          description: '서버 장애, 시스템 오류, 강의 내용의 부정확, 저작권 분쟁, 강사와 수강생 간 분쟁 등 회사의 고의 또는 중대한 과실이 없는 사유에 대해서는 회사가 책임을 지지 않습니다.',
          warning: true
        }
      ]
    },
    {
      id: '6',
      title: '이용계약 해지',
      icon: <LogOut className="h-5 w-5" />,
      summary: '회원 탈퇴 절차',
      color: 'gray',
      content: [
        {
          subtitle: '탈퇴 신청',
          description: '회원은 언제든지 플랫폼을 통해 탈퇴를 신청할 수 있으며, 회사는 즉시 처리합니다.'
        },
        {
          subtitle: '탈퇴 보류',
          description: '진행 중인 수강, 미해결 환불, 판매 강의가 있는 강사, 저작권 위반 사항 등이 있는 경우 탈퇴 처리가 보류될 수 있습니다.',
          warning: true
        }
      ]
    },
    {
      id: '7',
      title: '약관 개정',
      icon: <Edit className="h-5 w-5" />,
      summary: '약관 변경 절차',
      color: 'indigo',
      content: [
        {
          subtitle: '개정 권한',
          description: '회사는 관련 법령을 위반하지 않는 범위에서 본 약관을 개정할 수 있습니다.'
        },
        {
          subtitle: '사전 공지',
          description: '약관 개정 시 시행일자 및 개정 사유를 명시하여 최소 7일 전부터 공지합니다.'
        },
        {
          subtitle: '동의 간주',
          description: '회원이 개정 약관에 동의하지 않을 경우 서비스 이용을 중단하고 탈퇴할 수 있으며, 별도 의사표시가 없을 경우 동의한 것으로 간주합니다.',
          highlight: true
        }
      ]
    },
    {
      id: '8',
      title: '관할 및 준거법',
      icon: <Gavel className="h-5 w-5" />,
      summary: '분쟁 해결 기준',
      color: 'brown',
      content: [
        {
          subtitle: '준거법',
          description: '본 약관에 관한 분쟁은 대한민국 법령에 따릅니다.'
        },
        {
          subtitle: '관할 법원',
          description: '분쟁 발생 시 회사 본점 소재지 관할 법원을 전속적 합의관할로 합니다.'
        }
      ]
    }
  ]

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
      blue: { 
        bg: 'bg-blue-50', 
        text: 'text-blue-900', 
        border: 'border-blue-200',
        icon: 'bg-blue-100 text-blue-600'
      },
      green: { 
        bg: 'bg-green-50', 
        text: 'text-green-900', 
        border: 'border-green-200',
        icon: 'bg-green-100 text-green-600'
      },
      orange: { 
        bg: 'bg-orange-50', 
        text: 'text-orange-900', 
        border: 'border-orange-200',
        icon: 'bg-orange-100 text-orange-600'
      },
      purple: { 
        bg: 'bg-purple-50', 
        text: 'text-purple-900', 
        border: 'border-purple-200',
        icon: 'bg-purple-100 text-purple-600'
      },
      cyan: { 
        bg: 'bg-cyan-50', 
        text: 'text-cyan-900', 
        border: 'border-cyan-200',
        icon: 'bg-cyan-100 text-cyan-600'
      },
      red: { 
        bg: 'bg-red-50', 
        text: 'text-red-900', 
        border: 'border-red-200',
        icon: 'bg-red-100 text-red-600'
      },
      gray: { 
        bg: 'bg-gray-50', 
        text: 'text-gray-900', 
        border: 'border-gray-200',
        icon: 'bg-gray-100 text-gray-600'
      },
      indigo: { 
        bg: 'bg-indigo-50', 
        text: 'text-indigo-900', 
        border: 'border-indigo-200',
        icon: 'bg-indigo-100 text-indigo-600'
      },
      brown: { 
        bg: 'bg-amber-50', 
        text: 'text-amber-900', 
        border: 'border-amber-200',
        icon: 'bg-amber-100 text-amber-600'
      }
    }
    return colors[color] || colors.gray
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur mb-4">
              <ScrollText className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              이용약관
            </h1>
            <p className="text-lg sm:text-xl text-orange-100 max-w-3xl mx-auto">
              Lingoost 온라인 교육 플랫폼 서비스 이용약관
            </p>
            <div className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-4 py-2">
              <Building2 className="h-4 w-4" />
              <span className="text-sm font-medium">주식회사 럿지</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Important Notice */}
        <Alert className="mb-8 border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <AlertDescription className="text-sm sm:text-base text-gray-800">
            <span className="font-bold text-orange-600">중요 안내:</span> 본 약관은 링구스트(Lingoost) 플랫폼 이용에 관한 
            회원과 회사 간의 권리와 의무를 규정합니다. 서비스 이용 전 반드시 숙지하시기 바랍니다.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  약관 목차
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="divide-y divide-gray-100">
                  {termsData.map((section) => {
                    const colors = getColorClasses(section.color)
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={cn(
                          "w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3",
                          activeSection === section.id && "bg-orange-50 border-l-4 border-orange-500"
                        )}
                      >
                        <div className={cn("p-1.5 rounded-lg", colors.icon)}>
                          {section.icon}
                        </div>
                        <div className="flex-1">
                          <p className={cn(
                            "font-medium text-sm",
                            activeSection === section.id ? "text-orange-600" : "text-gray-900"
                          )}>
                            {section.id === '0' ? '총칙' : `제${section.id}조`} {section.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{section.summary}</p>
                        </div>
                        {activeSection === section.id && (
                          <ChevronRight className="h-4 w-4 text-orange-500" />
                        )}
                      </button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Quick Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-blue-200">
                      <HandshakeIcon className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">플랫폼 역할</p>
                      <p className="text-xs text-blue-700">온라인 교육 중개</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-200">
                      <ShieldCheck className="h-5 w-5 text-green-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-900">책임 범위</p>
                      <p className="text-xs text-green-700">제한적 책임</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-orange-200">
                      <Scale className="h-5 w-5 text-orange-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-orange-900">준거법</p>
                      <p className="text-xs text-orange-700">대한민국 법령</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Terms Content */}
            <Accordion type="single" value={activeSection} onValueChange={setActiveSection} className="space-y-4">
              {termsData.map((section) => {
                const colors = getColorClasses(section.color)
                return (
                  <AccordionItem key={section.id} value={section.id} className="border-none">
                    <Card className={cn("overflow-hidden hover:shadow-lg transition-all duration-300", colors.border)}>
                      <AccordionTrigger className="hover:no-underline px-6 py-4">
                        <div className="flex items-center gap-4 w-full">
                          <div className={cn("p-3 rounded-full", colors.icon)}>
                            {section.icon}
                          </div>
                          <div className="flex-1 text-left">
                            <h2 className="text-xl font-bold text-gray-900">
                              {section.id === '0' ? '' : `제${section.id}조. `}{section.title}
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">{section.summary}</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <Separator />
                        <div className={cn("p-6 space-y-4", colors.bg)}>
                          {section.content.map((item, idx) => (
                            <div 
                              key={idx} 
                              className={cn(
                                "relative pl-6",
                                item.highlight && "bg-white/80 rounded-lg p-4 border-l-4 border-orange-400",
                                item.warning && "bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400"
                              )}
                            >
                              <div className="absolute left-0 top-2">
                                <CircleDot className={cn("h-3 w-3", colors.text)} />
                              </div>
                              <div>
                                <h3 className={cn("font-semibold mb-2", colors.text)}>
                                  {item.subtitle}
                                </h3>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {item.description}
                                </p>
                                {item.warning && (
                                  <div className="mt-2 flex items-start gap-2">
                                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                                    <span className="text-xs text-yellow-700">주의사항</span>
                                  </div>
                                )}
                                {item.highlight && (
                                  <div className="mt-2 flex items-start gap-2">
                                    <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                                    <span className="text-xs text-blue-700">중요</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </Card>
                  </AccordionItem>
                )
              })}
            </Accordion>

            {/* Agreement Notice */}
            <Card className="border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-orange-100">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-orange-200 flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-orange-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">약관 동의</h3>
                    <p className="text-sm text-gray-700 mb-3">
                      본 약관은 회원가입 시 동의하신 내용이며, 서비스 이용 시 본 약관이 적용됩니다.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                        시행일: 2025.09.21
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                        버전: 1.0.0
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center py-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            © 2025 주식회사 럿지 | Lingoost Online Education Platform
          </p>
          <div className="mt-2 flex justify-center gap-4">
            <Link href="/privacy" className="text-xs text-gray-500 hover:text-orange-600 transition-colors">
              개인정보처리방침
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/refund-policy" className="text-xs text-gray-500 hover:text-orange-600 transition-colors">
              환불정책
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/contact" className="text-xs text-gray-500 hover:text-orange-600 transition-colors">
              고객센터
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}