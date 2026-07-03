import { Mail, MapPin } from "lucide-react"
import { useReveal } from "@/hooks/use-reveal"
import { useRef, useState, type ChangeEvent, type FormEvent } from "react"
import { MagneticButton } from "@/components/magnetic-button"
import { toast } from "@/hooks/use-toast"
import Icon from "@/components/ui/icon"

const FACTORS = ["Шум", "Вибрация", "Освещённость", "МАЭД", "Гамма-съёмка", "ЭМИ"]

export function ContactSection() {
  const { ref, isVisible } = useReveal(0.3)
  const [formData, setFormData] = useState({
    company: "",
    contactPerson: "",
    inn: "",
    phone: "",
    email: "",
    objectAddress: "",
    factors: [] as string[],
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [schemeFile, setSchemeFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSchemeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setSchemeFile(file)
  }

  const toggleFactor = (factor: string) => {
    setFormData((prev) => ({
      ...prev,
      factors: prev.factors.includes(factor)
        ? prev.factors.filter((f) => f !== factor)
        : [...prev.factors, factor],
    }))
  }

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        resolve(result.split(",")[1] || "")
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!formData.company || !formData.contactPerson || !formData.email || !formData.objectAddress) {
      toast({ title: "Заполните обязательные поля", variant: "destructive" })
      return
    }

    setIsSubmitting(true)

    try {
      const schemeFileBase64 = schemeFile ? await fileToBase64(schemeFile) : ""

      const response = await fetch("https://functions.poehali.dev/5d0fc7c4-bb32-472f-97e0-5295c033c031", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          schemeFileName: schemeFile?.name || "",
          schemeFileBase64,
        }),
      })

      if (!response.ok) throw new Error("Ошибка отправки")

      setSubmitSuccess(true)
      setFormData({
        company: "",
        contactPerson: "",
        inn: "",
        phone: "",
        email: "",
        objectAddress: "",
        factors: [],
        message: "",
      })
      setSchemeFile(null)
      setTimeout(() => setSubmitSuccess(false), 5000)
    } catch {
      toast({ title: "Не удалось отправить заявку. Попробуйте позже.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section
      ref={ref}
      className="flex h-screen w-screen shrink-0 snap-start items-center overflow-y-auto px-4 pt-24 pb-8 md:px-12 md:pt-0 lg:px-16"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid gap-8 md:grid-cols-[1fr_1.3fr] md:gap-16 lg:gap-24">
          <div className="flex flex-col justify-center">
            <div
              className={`mb-6 transition-all duration-700 md:mb-12 ${
                isVisible ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"
              }`}
            >
              <h2 className="mb-2 font-sans text-4xl font-light leading-[1.05] tracking-tight text-foreground md:mb-3 md:text-7xl lg:text-8xl">
                Оставить
                <br />
                заявку
              </h2>
              <p className="font-mono text-xs text-foreground/60 md:text-base">/ Свяжитесь с лабораторией</p>
            </div>

            <div className="space-y-4 md:space-y-8">
              <a
                href="mailto:lab@fizfaktory.ru"
                className={`group block transition-all duration-700 ${
                  isVisible ? "translate-x-0 opacity-100" : "-translate-x-16 opacity-0"
                }`}
                style={{ transitionDelay: "200ms" }}
              >
                <div className="mb-1 flex items-center gap-2">
                  <Mail className="h-3 w-3 text-foreground/60" />
                  <span className="font-mono text-xs text-foreground/60">Email</span>
                </div>
                <p className="text-base text-foreground transition-colors group-hover:text-foreground/70 md:text-2xl">
                  lab@fizfaktory.ru
                </p>
              </a>

              <div
                className={`transition-all duration-700 ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                }`}
                style={{ transitionDelay: "350ms" }}
              >
                <div className="mb-1 flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-foreground/60" />
                  <span className="font-mono text-xs text-foreground/60">Локация</span>
                </div>
                <p className="text-base text-foreground md:text-2xl">Чувашская Республика, Чебоксары, Россия</p>
              </div>

              <div
                className={`flex gap-2 pt-2 transition-all duration-700 md:pt-4 ${
                  isVisible ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"
                }`}
                style={{ transitionDelay: "500ms" }}
              >
                {["Telegram", "WhatsApp", "VK"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="border-b border-transparent font-mono text-xs text-foreground/60 transition-all hover:border-foreground/60 hover:text-foreground/90"
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right side - Detailed form */}
          <div className="flex flex-col justify-center">
            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              <div className="grid gap-3 md:grid-cols-2 md:gap-4">
                <div
                  className={`transition-all duration-700 ${
                    isVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"
                  }`}
                  style={{ transitionDelay: "150ms" }}
                >
                  <label className="mb-1 block font-mono text-xs text-foreground/60 md:mb-2">
                    Организация / ФИО заказчика *
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    required
                    className="w-full border-b border-foreground/30 bg-transparent py-1.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground/50 focus:outline-none md:py-2 md:text-base"
                    placeholder="ООО «Компания»"
                  />
                </div>

                <div
                  className={`transition-all duration-700 ${
                    isVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"
                  }`}
                  style={{ transitionDelay: "200ms" }}
                >
                  <label className="mb-1 block font-mono text-xs text-foreground/60 md:mb-2">
                    Контактное лицо *
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    required
                    className="w-full border-b border-foreground/30 bg-transparent py-1.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground/50 focus:outline-none md:py-2 md:text-base"
                    placeholder="Иванов Иван Иванович"
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 md:gap-4">
                <div
                  className={`transition-all duration-700 ${
                    isVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"
                  }`}
                  style={{ transitionDelay: "250ms" }}
                >
                  <label className="mb-1 block font-mono text-xs text-foreground/60 md:mb-2">ИНН</label>
                  <input
                    type="text"
                    value={formData.inn}
                    onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
                    className="w-full border-b border-foreground/30 bg-transparent py-1.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground/50 focus:outline-none md:py-2 md:text-base"
                    placeholder="0000000000"
                  />
                </div>

                <div
                  className={`transition-all duration-700 ${
                    isVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"
                  }`}
                  style={{ transitionDelay: "300ms" }}
                >
                  <label className="mb-1 block font-mono text-xs text-foreground/60 md:mb-2">Телефон</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border-b border-foreground/30 bg-transparent py-1.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground/50 focus:outline-none md:py-2 md:text-base"
                    placeholder="+7 900 000-00-00"
                  />
                </div>
              </div>

              <div
                className={`transition-all duration-700 ${
                  isVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"
                }`}
                style={{ transitionDelay: "350ms" }}
              >
                <label className="mb-1 block font-mono text-xs text-foreground/60 md:mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full border-b border-foreground/30 bg-transparent py-1.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground/50 focus:outline-none md:py-2 md:text-base"
                  placeholder="your@email.com"
                />
              </div>

              <div
                className={`transition-all duration-700 ${
                  isVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"
                }`}
                style={{ transitionDelay: "400ms" }}
              >
                <label className="mb-1 block font-mono text-xs text-foreground/60 md:mb-2">
                  Адрес объекта измерений *
                </label>
                <input
                  type="text"
                  value={formData.objectAddress}
                  onChange={(e) => setFormData({ ...formData, objectAddress: e.target.value })}
                  required
                  className="w-full border-b border-foreground/30 bg-transparent py-1.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground/50 focus:outline-none md:py-2 md:text-base"
                  placeholder="Город, улица, дом"
                />
              </div>

              <div
                className={`transition-all duration-700 ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
                style={{ transitionDelay: "450ms" }}
              >
                <label className="mb-2 block font-mono text-xs text-foreground/60">
                  Исследуемые показатели
                </label>
                <div className="flex flex-wrap gap-2">
                  {FACTORS.map((factor) => (
                    <button
                      type="button"
                      key={factor}
                      onClick={() => toggleFactor(factor)}
                      className={`rounded-full border px-3 py-1 font-mono text-xs transition-colors ${
                        formData.factors.includes(factor)
                          ? "border-foreground/60 bg-foreground/15 text-foreground"
                          : "border-foreground/20 text-foreground/60 hover:border-foreground/40 hover:text-foreground/90"
                      }`}
                    >
                      {factor}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className={`transition-all duration-700 ${
                  isVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"
                }`}
                style={{ transitionDelay: "500ms" }}
              >
                <label className="mb-1 block font-mono text-xs text-foreground/60 md:mb-2">
                  Дополнительные сведения
                </label>
                <textarea
                  rows={2}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full border-b border-foreground/30 bg-transparent py-1.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground/50 focus:outline-none md:py-2 md:text-base"
                  placeholder="Сроки, требования НД и другие детали"
                />
              </div>

              <div
                className={`pt-2 transition-all duration-700 ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                }`}
                style={{ transitionDelay: "500ms" }}
              >
                <label className="mb-2 block font-mono text-xs text-foreground/60">
                  Схема размещения точек измерений
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSchemeChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-foreground/20 bg-foreground/5 px-6 py-3 font-mono text-sm text-foreground/80 backdrop-blur-xl transition-all hover:border-foreground/40 hover:text-foreground"
                >
                  <Icon name="Upload" size={16} />
                  {schemeFile ? schemeFile.name : "Загрузить схему объекта"}
                </button>
              </div>

              <div
                className={`pt-4 transition-all duration-700 ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                }`}
                style={{ transitionDelay: "550ms" }}
              >
                <MagneticButton
                  variant="primary"
                  size="lg"
                  className="w-full py-5 text-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Отправка..." : "Отправить заявку"}
                </MagneticButton>
                {submitSuccess && (
                  <p className="mt-3 text-center font-mono text-sm text-foreground/80">Заявка отправлена!</p>
                )}
                <a
                  href="/forms/zayavka-blank.doc"
                  download
                  className="mt-4 block text-center font-mono text-xs text-foreground/60 underline decoration-foreground/30 underline-offset-4 transition-colors hover:text-foreground/90 hover:decoration-foreground/60"
                >
                  Скачать бланк заявки (Ф-07-01-РК)
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}