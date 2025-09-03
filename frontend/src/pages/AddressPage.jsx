import { useEffect, useState, useRef } from "react";
import { parsePhoneNumberFromString, AsYouType, getExampleNumber } from 'libphonenumber-js';
import examples from 'libphonenumber-js/mobile/examples';
import { useNavigate } from 'react-router-dom';

const COUNTRY_CODES = [
  { code: "+996", name: "Кыргызстан", flag: "🇰🇬" },
  { code: "+7", name: "Россия", flag: "🇷🇺" },
  { code: "+93", name: "Афганистан", flag: "🇦🇫" },
  { code: "+355", name: "Албания", flag: "🇦🇱" },
  { code: "+213", name: "Алжир", flag: "🇩🇿" },
  { code: "+376", name: "Андорра", flag: "🇦🇩" },
  { code: "+244", name: "Ангола", flag: "🇦🇴" },
  { code: "+374", name: "Армения", flag: "🇦🇲" },
  { code: "+297", name: "Аруба", flag: "🇦🇼" },
  { code: "+61", name: "Австралия", flag: "🇦🇺" },
  { code: "+43", name: "Австрия", flag: "🇦🇹" },
  { code: "+994", name: "Азербайджан", flag: "🇦🇿" },
  { code: "+1242", name: "Багамы", flag: "🇧🇸" },
  { code: "+973", name: "Бахрейн", flag: "🇧🇭" },
  { code: "+880", name: "Бангладеш", flag: "🇧🇩" },
  { code: "+375", name: "Беларусь", flag: "🇧🇾" },
  { code: "+32", name: "Бельгия", flag: "🇧🇪" },
  { code: "+501", name: "Белиз", flag: "🇧🇿" },
  { code: "+229", name: "Бенин", flag: "🇧🇯" },
  { code: "+975", name: "Бутан", flag: "🇧🇹" },
  { code: "+591", name: "Боливия", flag: "🇧🇴" },
  { code: "+387", name: "Босния и Герцеговина", flag: "🇧🇦" },
  { code: "+267", name: "Ботсвана", flag: "🇧🇼" },
  { code: "+55", name: "Бразилия", flag: "🇧🇷" },
  { code: "+359", name: "Болгария", flag: "🇧🇬" },
  { code: "+226", name: "Буркина-Фасо", flag: "🇧🇫" },
  { code: "+257", name: "Бурунди", flag: "🇧🇮" },
  { code: "+855", name: "Камбоджа", flag: "🇰🇭" },
  { code: "+237", name: "Камерун", flag: "🇨🇲" },
  { code: "+1", name: "Канада", flag: "🇨🇦" },
  { code: "+236", name: "ЦАР", flag: "🇨🇫" },
  { code: "+235", name: "Чад", flag: "🇹🇩" },
  { code: "+56", name: "Чили", flag: "🇨🇱" },
  { code: "+86", name: "Китай", flag: "🇨🇳" },
  { code: "+57", name: "Колумбия", flag: "🇨🇴" },
  { code: "+269", name: "Коморы", flag: "🇰🇲" },
  { code: "+242", name: "Конго", flag: "🇨🇬" },
  { code: "+506", name: "Коста-Рика", flag: "🇨🇷" },
  { code: "+385", name: "Хорватия", flag: "🇭🇷" },
  { code: "+53", name: "Куба", flag: "🇨🇺" },
  { code: "+357", name: "Кипр", flag: "🇨🇾" },
  { code: "+420", name: "Чехия", flag: "🇨🇿" },
  { code: "+45", name: "Дания", flag: "🇩🇰" },
  { code: "+253", name: "Джибути", flag: "🇩🇯" },
  { code: "+1809", name: "Доминиканская Республика", flag: "🇩🇴" },
  { code: "+593", name: "Эквадор", flag: "🇪🇨" },
  { code: "+20", name: "Египет", flag: "🇪🇬" },
  { code: "+503", name: "Сальвадор", flag: "🇸🇻" },
  { code: "+240", name: "Экваториальная Гвинея", flag: "🇬🇶" },
  { code: "+291", name: "Эритрея", flag: "🇪🇷" },
  { code: "+372", name: "Эстония", flag: "🇪🇪" },
  { code: "+251", name: "Эфиопия", flag: "🇪🇹" },
  { code: "+679", name: "Фиджи", flag: "🇫🇯" },
  { code: "+358", name: "Финляндия", flag: "🇫🇮" },
  { code: "+33", name: "Франция", flag: "🇫🇷" },
  { code: "+241", name: "Габон", flag: "🇬🇦" },
  { code: "+220", name: "Гамбия", flag: "🇬🇲" },
  { code: "+995", name: "Грузия", flag: "🇬🇪" },
  { code: "+49", name: "Германия", flag: "🇩🇪" },
  { code: "+233", name: "Гана", flag: "🇬🇭" },
  { code: "+30", name: "Греция", flag: "🇬🇷" },
  { code: "+299", name: "Гренландия", flag: "🇬🇱" },
  { code: "+502", name: "Гватемала", flag: "🇬🇹" },
  { code: "+224", name: "Гвинея", flag: "🇬🇳" },
  { code: "+245", name: "Гвинея-Бисау", flag: "🇬🇼" },
  { code: "+592", name: "Гайана", flag: "🇬🇾" },
  { code: "+509", name: "Гаити", flag: "🇭🇹" },
  { code: "+504", name: "Гондурас", flag: "🇭🇳" },
  { code: "+852", name: "Гонконг", flag: "🇭🇰" },
  { code: "+36", name: "Венгрия", flag: "🇭🇺" },
  { code: "+354", name: "Исландия", flag: "🇮🇸" },
  { code: "+91", name: "Индия", flag: "🇮🇳" },
  { code: "+62", name: "Индонезия", flag: "🇮🇩" },
  { code: "+98", name: "Иран", flag: "🇮🇷" },
  { code: "+964", name: "Ирак", flag: "🇮🇶" },
  { code: "+353", name: "Ирландия", flag: "🇮🇪" },
  { code: "+972", name: "Израиль", flag: "🇮🇱" },
  { code: "+39", name: "Италия", flag: "🇮🇹" },
  { code: "+1876", name: "Ямайка", flag: "🇯🇲" },
  { code: "+81", name: "Япония", flag: "🇯🇵" },
  { code: "+962", name: "Иордания", flag: "🇯🇴" },
  { code: "+7", name: "Казахстан", flag: "🇰🇿" },
  { code: "+254", name: "Кения", flag: "🇰🇪" },
  { code: "+965", name: "Кувейт", flag: "🇰🇼" },
  { code: "+856", name: "Лаос", flag: "🇱🇦" },
  { code: "+371", name: "Латвия", flag: "🇱🇻" },
  { code: "+961", name: "Ливан", flag: "🇱🇧" },
  { code: "+266", name: "Лесото", flag: "🇱🇸" },
  { code: "+231", name: "Либерия", flag: "🇱🇷" },
  { code: "+218", name: "Ливия", flag: "🇱🇾" },
  { code: "+423", name: "Лихтенштейн", flag: "🇱🇮" },
  { code: "+370", name: "Литва", flag: "🇱🇹" },
  { code: "+352", name: "Люксембург", flag: "🇱🇺" },
  { code: "+853", name: "Макао", flag: "🇲🇴" },
  { code: "+389", name: "Северная Македония", flag: "🇲🇰" },
  { code: "+261", name: "Мадагаскар", flag: "🇲🇬" },
  { code: "+265", name: "Малави", flag: "🇲🇼" },
  { code: "+60", name: "Малайзия", flag: "🇲🇾" },
  { code: "+960", name: "Мальдивы", flag: "🇲🇻" },
  { code: "+223", name: "Мали", flag: "🇲🇱" },
  { code: "+356", name: "Мальта", flag: "🇲🇹" },
  { code: "+222", name: "Мавритания", flag: "🇲🇷" },
  { code: "+230", name: "Маврикий", flag: "🇲🇺" },
  { code: "+52", name: "Мексика", flag: "🇲🇽" },
  { code: "+373", name: "Молдова", flag: "🇲🇩" },
  { code: "+377", name: "Монако", flag: "🇲🇨" },
  { code: "+976", name: "Монголия", flag: "🇲🇳" },
  { code: "+382", name: "Черногория", flag: "🇲🇪" },
  { code: "+212", name: "Марокко", flag: "🇲🇦" },
  { code: "+258", name: "Мозамбик", flag: "🇲🇿" },
  { code: "+95", name: "Мьянма", flag: "🇲🇲" },
  { code: "+264", name: "Намибия", flag: "🇳🇦" },
  { code: "+977", name: "Непал", flag: "🇳🇵" },
  { code: "+31", name: "Нидерланды", flag: "🇳🇱" },
  { code: "+64", name: "Новая Зеландия", flag: "🇳🇿" },
  { code: "+505", name: "Никарагуа", flag: "🇳🇮" },
  { code: "+227", name: "Нигер", flag: "🇳🇪" },
  { code: "+234", name: "Нигерия", flag: "🇳🇬" },
  { code: "+850", name: "КНДР", flag: "🇰🇵" },
  { code: "+47", name: "Норвегия", flag: "🇳🇴" },
  { code: "+968", name: "Оман", flag: "🇴🇲" },
  { code: "+92", name: "Пакистан", flag: "🇵🇰" },
  { code: "+970", name: "Палестина", flag: "🇵🇸" },
  { code: "+507", name: "Панама", flag: "🇵🇦" },
  { code: "+675", name: "Папуа-Новая Гвинея", flag: "🇵🇬" },
  { code: "+595", name: "Парагвай", flag: "🇵🇾" },
  { code: "+51", name: "Перу", flag: "🇵🇪" },
  { code: "+63", name: "Филиппины", flag: "🇵🇭" },
  { code: "+48", name: "Польша", flag: "🇵🇱" },
  { code: "+351", name: "Португалия", flag: "🇵🇹" },
  { code: "+974", name: "Катар", flag: "🇶🇦" },
  { code: "+40", name: "Румыния", flag: "🇷🇴" },
  { code: "+250", name: "Руанда", flag: "🇷🇼" },
  { code: "+966", name: "Саудовская Аравия", flag: "🇸🇦" },
  { code: "+221", name: "Сенегал", flag: "🇸🇳" },
  { code: "+381", name: "Сербия", flag: "🇷🇸" },
  { code: "+248", name: "Сейшелы", flag: "🇸🇨" },
  { code: "+232", name: "Сьерра-Леоне", flag: "🇸🇱" },
  { code: "+65", name: "Сингапур", flag: "🇸🇬" },
  { code: "+421", name: "Словакия", flag: "🇸🇰" },
  { code: "+386", name: "Словения", flag: "🇸🇮" },
  { code: "+252", name: "Сомали", flag: "🇸🇴" },
  { code: "+27", name: "ЮАР", flag: "🇿🇦" },
  { code: "+82", name: "Южная Корея", flag: "🇰🇷" },
  { code: "+211", name: "Южный Судан", flag: "🇸🇸" },
  { code: "+34", name: "Испания", flag: "🇪🇸" },
  { code: "+94", name: "Шри-Ланка", flag: "🇱🇰" },
  { code: "+249", name: "Судан", flag: "🇸🇩" },
  { code: "+597", name: "Суринам", flag: "🇸🇷" },
  { code: "+46", name: "Швеция", flag: "🇸🇪" },
  { code: "+41", name: "Швейцария", flag: "🇨🇭" },
  { code: "+963", name: "Сирия", flag: "🇸🇾" },
  { code: "+886", name: "Тайвань", flag: "🇹🇼" },
  { code: "+992", name: "Таджикистан", flag: "🇹🇯" },
  { code: "+255", name: "Танзания", flag: "🇹🇿" },
  { code: "+66", name: "Таиланд", flag: "🇹🇭" },
  { code: "+228", name: "Того", flag: "🇹🇬" },
  { code: "+676", name: "Тонга", flag: "🇹🇴" },
  { code: "+216", name: "Тунис", flag: "🇹🇳" },
  { code: "+90", name: "Турция", flag: "🇹🇷" },
  { code: "+993", name: "Туркменистан", flag: "🇹🇲" },
  { code: "+256", name: "Уганда", flag: "🇺🇬" },
  { code: "+380", name: "Украина", flag: "🇺🇦" },
  { code: "+971", name: "ОАЭ", flag: "🇦🇪" },
  { code: "+44", name: "Великобритания", flag: "🇬🇧" },
  { code: "+1", name: "США", flag: "🇺🇸" },
  { code: "+598", name: "Уругвай", flag: "🇺🇾" },
  { code: "+998", name: "Узбекистан", flag: "🇺🇿" },
  { code: "+678", name: "Вануату", flag: "🇻🇺" },
  { code: "+379", name: "Ватикан", flag: "🇻🇦" },
  { code: "+58", name: "Венесуэла", flag: "🇻🇪" },
  { code: "+84", name: "Вьетнам", flag: "🇻🇳" },
  { code: "+967", name: "Йемен", flag: "🇾🇪" },
  { code: "+260", name: "Замбия", flag: "🇿🇲" },
  { code: "+263", name: "Зимбабве", flag: "🇿🇼" }
].sort((a, b) => a.name.localeCompare(b.name));

export function AddressPage() {
  const navigate = useNavigate();
  const [fullPhoneNumber, setFullPhoneNumber] = useState("+996"); // Начальное значение с кодом Кыргызстана
  const [countryCode, setCountryCode] = useState("+996");
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const prevCountryCodeRef = useRef(countryCode);

  // Получаем максимальную длину номера для выбранной страны
  const getMaxLength = (countryCode) => {
    const countryCallingCode = countryCode.replace("+", "");
    const exampleNumber = getExampleNumber(countryCallingCode, examples);
    if (exampleNumber) {
      // Добавляем 1 к длине, учитывая знак +
      return exampleNumber.formatInternational().length;
    }
    // Если не удалось определить, используем стандартное ограничение
    return 16;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // При изменении кода страны обновляем полный номер
  useEffect(() => {
    if (prevCountryCodeRef.current !== countryCode) {
      // При смене страны оставляем только код
      setFullPhoneNumber(countryCode);
      prevCountryCodeRef.current = countryCode;

      if (inputRef.current) {
        const position = countryCode.length;
        inputRef.current.setSelectionRange(position, position);
      }
    }
  }, [countryCode]);

  const validatePhoneNumber = (number) => {
    if (!number) {
      setError("Введите номер телефона");
      setIsValid(false);
      return;
    }

    const phoneNumber = parsePhoneNumberFromString(number);

    if (!phoneNumber) {
      setError("Неверный формат номера");
      setIsValid(false);
      return;
    }

    if (!phoneNumber.isValid()) {
      setError("Неверный номер телефона");
      setIsValid(false);
      return;
    }

    setError("");
    setIsValid(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid) {
      console.log("Поиск адреса для номера:", fullPhoneNumber);
    }
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    
    // Убеждаемся, что код страны всегда присутствует
    if (!value.startsWith('+')) {
      value = countryCode;
    }

    // Не позволяем удалить код страны
    if (value.length < countryCode.length) {
      value = countryCode;
    }

    // Проверяем максимальную длину
    const maxLength = getMaxLength(countryCode);
    if (value.length > maxLength) {
      return;
    }

    // Форматируем номер
    const formatter = new AsYouType();
    const formattedNumber = formatter.input(value);
    
    setFullPhoneNumber(formattedNumber);
    validatePhoneNumber(formattedNumber);
  };

  const handleCountryChange = (e) => {
    const value = e.target.value;
    const country = COUNTRY_CODES.find(c => 
      c.code === value || 
      c.name.toLowerCase().includes(value.toLowerCase()) ||
      c.code.includes(value)
    );
    
    if (country) {
      setCountryCode(country.code);
    }
  };

  const handlePhoneKeyDown = (e) => {
    // Предотвращаем удаление кода страны через Backspace
    if (e.key === 'Backspace' && fullPhoneNumber.length <= countryCode.length) {
      e.preventDefault();
    }
  };

  const handlePhoneFocus = () => {
    setIsFocused(true);
    // Устанавливаем курсор после кода страны
    if (inputRef.current) {
      const position = countryCode.length;
      inputRef.current.setSelectionRange(position, position);
    }
  };

  return (
    <div className="legal-page">
      <div className="legal-content">
        <div style={{ 
          maxWidth: '500px', 
          margin: '0 auto', 
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#f7fafc',
              border: '2px solid #e2e8f0',
              color: '#4a5568',
              fontSize: '0.95rem',
              cursor: 'pointer',
              padding: '8px 16px',
              marginBottom: '2rem',
              borderRadius: '6px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              ':hover': {
                background: '#edf2f7',
                borderColor: '#cbd5e0',
                transform: 'translateX(-2px)'
              }
            }}
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{
                marginRight: '4px',
                position: 'relative',
                top: '1px'
              }}
            >
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Назад
          </button>

          <h1 style={{ 
            textAlign: 'center', 
            marginBottom: '2rem',
            fontSize: '1.8rem',
            color: '#2d3748'
          }}>
            Поиск по адресу
          </h1>
          
          <div style={{ 
            backgroundColor: '#f7fafc',
            borderRadius: '6px',
            padding: '1rem',
            marginBottom: '2rem'
          }}>
            <p style={{ 
              margin: '0',
              color: '#4a5568',
              fontSize: '0.9rem',
              lineHeight: '1.5'
            }}>
              🏠 Введите номер телефона владельца для поиска информации об адресе.
              Убедитесь, что номер введен корректно.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: '#4a5568',
                fontSize: '0.95rem',
                fontWeight: '500'
              }}>
                Номер телефона
              </label>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '10px',
                position: 'relative'
              }}>
                <select 
                  value={countryCode}
                  onChange={handleCountryChange}
                  style={{
                    padding: '12px',
                    borderRadius: '6px',
                    border: '2px solid #e2e8f0',
                    width: '100%',
                    backgroundColor: 'white',
                    fontSize: '0.95rem',
                    color: '#2d3748',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    outline: 'none',
                    maxHeight: '200px',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none'
                  }}
                >
                  <option value="" disabled>Поиск страны...</option>
                  {COUNTRY_CODES.map(country => (
                    <option 
                      key={`${country.code}-${country.name}`} 
                      value={country.code}
                    >
                      {country.flag} {country.code} {country.name}
                    </option>
                  ))}
                </select>
                <div style={{ position: 'relative' }}>
                  <input
                    ref={inputRef}
                    type="tel"
                    value={fullPhoneNumber}
                    onChange={handlePhoneChange}
                    onKeyDown={handlePhoneKeyDown}
                    onFocus={handlePhoneFocus}
                    onBlur={() => setIsFocused(false)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      paddingLeft: '12px',
                      borderRadius: '6px',
                      border: `2px solid ${isFocused ? '#4299e1' : '#e2e8f0'}`,
                      fontSize: '0.95rem',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
              {error && (
                <p style={{ 
                  color: '#e53e3e', 
                  marginTop: '0.5rem', 
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ fontSize: '1.1em' }}>⚠️</span> {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!isValid}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: isValid ? '#4299e1' : '#cbd5e0',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isValid ? 'pointer' : 'not-allowed',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                ':hover': {
                  backgroundColor: isValid ? '#3182ce' : '#cbd5e0'
                }
              }}
            >
              {isValid ? '🔍' : '⏳'} Найти
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 