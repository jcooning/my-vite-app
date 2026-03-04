import React, { useState, useMemo, useRef, useEffect } from 'react'
import '../styles/Reservation.css'
import { useReservationStore } from '../store/zustand/useReservationStore'
import { saveReservationToNotion, updateReservationInNotion, getReservationsFromNotion } from '../api/notion'
import { DatePicker, TimePicker, Modal, Calendar, ConfigProvider, Collapse, Popover } from 'antd'
import locale from 'antd/locale/ko_KR'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import {
    UserOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
    ShoppingOutlined,
    CheckCircleOutlined,
    DeleteOutlined,
    ClockCircleOutlined,
    EditOutlined,
    SearchOutlined,
    CompassOutlined,
    BankOutlined,
    CopyOutlined,
    FileImageOutlined,
    CloseCircleOutlined,
    UnorderedListOutlined,
    EyeOutlined,
    FileTextOutlined,
    PlusOutlined,
    LeftOutlined,
    RightOutlined
} from '@ant-design/icons'

/**
 * [React 학습 포인트]
 * 1. Component: 화면의 한 부분을 담당하는 독립적인 구성 요소입니다.
 * 2. Hooks (useState, useEffect 등): React의 기능을 함수형 컴포넌트에서 사용할 수 있게 해주는 도구입니다.
 * 3. Props: 부모 컴포넌트가 자식 컴포넌트에게 전달하는 데이터입니다.
 * 4. State: 컴포넌트 내부에서 변경될 수 있는 "상태" 값입니다. 값이 바뀌면 화면이 다시 그려집니다(Render).
 */

// Configure dayjs
dayjs.extend(customParseFormat)
dayjs.locale('ko')

// Product Data
const mainProducts = [
    { name: 'Premium Album Package', price: 849000, desc: '50P 화보앨범 1권 + 부모님용 20P 앨범 2권\n원본 + 수정본 50컷' },
    { name: 'Special Album', price: 640000, desc: '50P 화보앨범 1권\n원본 + 수정본 50컷' },
    { name: 'Basic Album', price: 496000, desc: '30P 화보앨범 1권\n원본 + 수정본 30컷' },
    { name: 'Private Data', price: 389000, desc: '원본 + 수정본 30컷\n(데이터 전용)' },
    { name: 'Special Data', price: 318000, desc: '원본 + 수정본 20컷\n(데이터 전용)' }
]

const optionsList = [
    { name: '식전원판', price: 99000 },
    { name: '2부피로연', price: 198000 },
    { name: '피로연장인사', price: 99000 },
    { name: '야외웨딩', price: 88000 },
    { name: '교회예배', price: 77000 },
    { name: '기타', price: 0 }
]

const checkItems = [
    '모바일청첩장', '식순확인', '종이청첩장', '주례여부', '예물교환', '축가체크'
]

// Holidays Data
const holidays = {
    '2025-01-01': '신정', '2025-01-28': '설날', '2025-01-29': '설날', '2025-01-30': '설날', '2025-03-01': '삼일절',
    '2025-05-05': '어린이날', '2025-05-06': '대체공휴일', '2025-06-06': '현충일', '2025-08-15': '광복절',
    '2025-10-03': '개천절', '2025-10-05': '추석', '2025-10-06': '추석', '2025-10-07': '추석', '2025-10-08': '대체공휴일',
    '2025-10-09': '한글날', '2025-12-25': '성탄절',
    '2026-01-01': '신정', '2026-02-16': '설날', '2026-02-17': '설날', '2026-02-18': '설날', '2026-03-01': '삼일절',
    '2026-03-02': '대체공휴일', '2026-05-05': '어린이날', '2026-05-24': '부처님오신날', '2026-05-25': '대체공휴일',
    '2026-06-03': '지방선거', '2026-06-06': '현충일', '2026-08-15': '광복절', '2026-08-17': '대체공휴일',
    '2026-09-24': '추석', '2026-09-25': '추석', '2026-09-26': '추석', '2026-10-03': '개천절', '2026-10-05': '대체공휴일',
    '2026-10-09': '한글날', '2026-12-25': '성탄절',
    // 2027년 공휴일
    '2027-01-01': '신정', '2027-02-06': '설날', '2027-02-07': '설날', '2027-02-08': '설날', '2027-02-09': '대체공휴일',
    '2027-03-01': '삼일절', '2027-05-05': '어린이날', '2027-05-13': '부처님오신날', '2027-06-06': '현충일', 
    '2027-08-15': '광복절', '2027-08-16': '대체공휴일', '2027-09-14': '추석', '2027-09-15': '추석', '2027-09-16': '추석', 
    '2027-10-03': '개천절', '2027-10-04': '대체공휴일', '2027-10-09': '한글날', '2027-10-11': '대체공휴일', '2027-12-25': '성탄절', '2027-12-27': '대체공휴일',
    // 2028년 공휴일
    '2028-01-01': '신정', '2028-01-26': '설날', '2028-01-27': '설날', '2028-01-28': '설날', '2028-03-01': '삼일절',
    '2028-04-12': '국회의원선거', '2028-05-02': '부처님오신날', '2028-05-05': '어린이날', '2028-06-06': '현충일',
    '2028-08-15': '광복절', '2028-09-30': '추석', '2028-10-01': '추석', '2028-10-02': '추석', '2028-10-03': '개천절', 
    '2028-10-05': '대체공휴일', '2028-10-09': '한글날', '2028-12-25': '성탄절'
}

/**
 * ReceiptTemplate 컴포넌트
 * @param {Object} props - 부모로부터 전달받은 데이터 (formData, totalPrice)
 * 역할을 하는 순수 UI 컴포넌트입니다. 계약서나 영수증 모양을 화면에 그리거나 이미지로 저장할 때 사용됩니다.
 */
const ReceiptTemplate = ({ formData, totalPrice }) => {
    const selectedProduct = mainProducts.find(p => formData.products.includes(p.name));
    const productDesc = selectedProduct ? selectedProduct.desc : '-';

    return (
        <div style={{
            width: '800px',
            padding: '0',
            background: '#fff',
            fontFamily: "'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
            color: '#333',
            boxSizing: 'border-box',
            margin: '0 auto',
            border: '1px solid #eee',
            overflow: 'hidden',
            borderRadius: '16px'
        }}>
            {/* 1. Header with Title */}
            <div style={{ background: '#2c3149', padding: '40px 50px', color: '#fff' }}>
                <span style={{ fontSize: '0.8rem', color: '#fbc531', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '15px', display: 'block', fontWeight: '600' }}>WEDDING CEREMONY SPECIALIST</span>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0', letterSpacing: '-0.5px' }}>웨딩포토 스페셜리스트 박정훈작가</h1>
            </div>

            <div style={{ padding: '50px' }}>


                {/* 4. Wedding Details Section */}
                <div style={{ borderTop: '2px solid #333', paddingTop: '40px', marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '25px', fontWeight: '800', color: '#2c3149' }}>[ 예약 확정 내역 ]</h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, auto) 1fr', gap: '15px 30px', alignItems: 'start' }}>
                        <span style={{ color: '#888', fontSize: '1.0rem', fontWeight: '600' }}>GROOM & BRIDE</span>
                        <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{formData.groomName} ({formData.groomPhone}) & {formData.brideName} ({formData.bridePhone})</span>

                        <span style={{ color: '#888', fontSize: '1.0rem', fontWeight: '600' }}>WEDDING DATE</span>
                        <span style={{ fontWeight: '700', fontSize: '1.2rem' }}>{formData.weddingDate} {formData.weddingTime}</span>
                        
                        <span style={{ color: '#888', fontSize: '1.0rem', fontWeight: '600' }}>LOCATION</span>
                        <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{formData.location} <span style={{ fontWeight: '400', fontSize: '1.0rem', color: '#666', display: 'block', marginTop: '4px' }}>{formData.address}</span></span>
                        
                        <div style={{ gridColumn: '1 / span 2', height: '1px', background: '#eee', margin: '15px 0' }}></div>

                        <span style={{ color: '#888', fontSize: '1.0rem', fontWeight: '600' }}>선택 상품</span>
                        <span style={{ fontWeight: '700', fontSize: '1.2rem', color: '#2c3149' }}>{formData.products.length > 0 ? formData.products.join(', ') : '-'}</span>
                        
                        {/* 5. Product Description (moved directly below products) */}
                        <span style={{ color: '#888', fontSize: '1.0rem', fontWeight: '600' }}>상품 구성</span>
                        <span style={{ fontSize: '1.05rem', color: '#444', whiteSpace: 'pre-line', lineHeight: '1.6', background: '#f9f9fb', padding: '12px', borderRadius: '8px' }}>{productDesc}</span>

                        <span style={{ color: '#888', fontSize: '1.0rem', fontWeight: '600' }}>추가 옵션</span>
                        <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{formData.options.length > 0 ? formData.options.join(', ') : '-'}</span>
                    </div>
                </div>

                {/* 6. Pricing */}
                <div style={{ background: '#2c3149', padding: '25px 30px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>총 견적 금액</span>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.8rem', fontWeight: '800' }}>₩ {Number(totalPrice).toLocaleString()}</span>
                    </div>
                </div>

                {/* 7. Notices */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '50px' }}>
                    <div>
                        <h4 style={{ fontSize: '1.0rem', marginBottom: '12px', fontWeight: '700' }}>[ 촬영 안내 ]</h4>
                        <div style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.6' }}>
                            {formData.options.includes('식전원판') ? (
                                <>• 예식 1시간 30분 전 신랑신부님 미팅<br />&nbsp;&nbsp;및 식전원판 진행<br /></>
                            ) : (
                                <>• 예식 1시간 전 신랑신부님 미팅 및 촬영 시작<br /></>
                            )}
                            • 예식시작 ~ 퇴장행진 후 기념사진 촬영<br />
                            {formData.options.includes('2부피로연') && (
                                <>• 2부 피로연 촬영 진행<br /></>
                            )}
                            {formData.options.includes('피로연장인사') && (
                                <>• 피로연장 인사 촬영 진행<br /></>
                            )}
                            • 예식이 있는 주에 해피콜 최종 점검
                        </div>
                    </div>
                    <div>
                        <h4 style={{ fontSize: '1.0rem', marginBottom: '12px', fontWeight: '700' }}>[ 데이터 안내 ]</h4>
                        <div style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.6' }}>
                            • 10일 내 원본 메일 전송<br />
                            • 보정본 셀렉 후 앨범 제작 진행
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};





/**
 * Home 컴포넌트: 메인 페이지
 * 데이터 관리, 캘린더 표시, 입력 폼 등 모든 기능을 총괄하는 부모 컴포넌트입니다.
 */
const Home = () => {
    /* 1. 전역 상태 (Zustand) */
    // 여러 페이지에서 공유해야 하는 '예약 데이터'와 '선택된 날짜' 등을 가져옵니다.
    const { reservations, addReservation, removeReservation, updateReservation, setReservations, selectedDate, setSelectedDate } = useReservationStore()

    /* 2. 지역 상태 (useState) */
    // 이 컴포넌트 안에서만 쓰이는 상태들을 정의합니다. 주석을 통해 각 상태의 역할을 확인해보세요.
    const [viewDate, setViewDate] = useState(new Date()) // 캘린더에서 현재 보여주는 월(달) 정보
    const [filterDate, setFilterDate] = useState(null) // 특정 날짜를 클릭했을 때 목록을 필터링하기 위한 용도
    const [showAllReservations, setShowAllReservations] = useState(false) // 전체 목록을 보여줄지 여부
    const [editingId, setEditingId] = useState(null) // 현재 수정 중인 예약의 ID (null이면 새로 작성 모드)
    const [loading, setLoading] = useState(true) // 데이터 로딩 중 표시 여부

    // 모달(팝업창) 열림/닫힘 상태
    const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false) // 큰 달력 모달
    const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false) // 장소 검색 모달
    const [isPreviewOpen, setIsPreviewOpen] = useState(false) // 미리보기 모달
    const [timePickerOpen, setTimePickerOpen] = useState(false) // 시계 픽커 제어

    // 검색 관련 상태
    const [placeSearchQuery, setPlaceSearchQuery] = useState('') // 장소 검색어
    const [placeResults, setPlaceResults] = useState([]) // 장소 검색 결과 목록
    const [searchTerm, setSearchTerm] = useState('') // 하단 예약 목록의 이름 검색어

    /* 3. 사이드 이펙트 (useEffect) */
    // 컴포넌트가 처음 화면에 나타날 때(Mount) 실행할 코드입니다.
    // 여기서는 노션(Notion)에 저장된 예약 목록을 서버에서 가져옵니다.
    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const data = await getReservationsFromNotion();
                setReservations(data); // 가져온 데이터를 전역 상태에 저장하여 화면에 뿌려줍니다.
            } catch (error) {
                console.error('Failed to load reservations:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchReservations();
    }, [setReservations]);

    /* 4. 입력 폼 데이터 상태 (useState) */
    // 입력창(input, textarea 등)에 들어가는 모든 데이터들을 하나의 객체로 관리합니다.
    const [formData, setFormData] = useState({
        groomName: '', brideName: '', groomPhone: '', bridePhone: '',
        weddingDate: '', weddingTime: '', location: '', address: '',
        products: [], options: [], checks: [], memo: ''
    })



    /* 5. 연산 프로퍼티 (useMemo) */
    // [학습 포인트] useMemo는 "계산 결과"를 기억해두는 녀석입니다.
    // formData.products나 formData.options가 바뀌었을 때만 가격을 다시 계산합니다.
    // 그렇지 않으면 다른 무관한 타이핑을 할 때마다 쓸데없이 가격을 다시 계산하게 됩니다(성능 최적화).
    const totalPrice = useMemo(() => {
        const productPrice = mainProducts.filter(p => formData.products.includes(p.name)).reduce((sum, p) => sum + p.price, 0)
        const optionPrice = optionsList.filter(o => formData.options.includes(o.name)).reduce((sum, o) => sum + o.price, 0)
        return productPrice + optionPrice
    }, [formData.products, formData.options])

    /* 6. 이벤트 핸들러 (함수들) */
    // [학습 포인트] React에서 입력값은 보통 e.target.value로 받아와서 상태(state)에 넣어줍니다.

    // 전화번호 입력 시 자동으로 하이픈(-)을 넣어주는 편의 기능
    const formatPhoneNumber = (value) => {
        // 숫자만 남깁니다.
        let raw = value.replace(/[^\d]/g, "")

        // 무조건 "010"으로 시작하도록 강제합니다.
        if (!raw.startsWith("010")) {
            raw = "010" + raw
        }

        // 하이픈을 넣기 위해 글자수를 체크합니다 (010-XXXX-XXXX 형식)
        if (raw.length <= 3) return "010-"
        if (raw.length <= 7) {
            return `010-${raw.slice(3)}`
        }
        return `010-${raw.slice(3, 7)}-${raw.slice(7, 11)}`
    }

    // 모든 input 입력 변화를 감지하여 상태를 업데이트합니다. (Controlled Component 방식)
    const handleInputChange = (e) => {
        const { name, value } = e.target
        if (name === "groomPhone" || name === "bridePhone") {
            setFormData(prev => ({ ...prev, [name]: formatPhoneNumber(value) }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleDateChange = (date) => {
        const dateStr = date ? date.format('YYYY-MM-DD') : ''
        setFormData(prev => ({ ...prev, weddingDate: dateStr }))
        if (date) setSelectedDate(date.toDate())
    }

    const handleTimeChange = (time) => {
        const timeStr = time ? time.format('HH:mm') : ''
        setFormData(prev => ({ ...prev, weddingTime: timeStr }))
    }

    const handleToggle = (type, value) => {
        if (type === 'products') {
            setFormData(prev => ({
                ...prev,
                products: prev.products.includes(value) ? [] : [value]
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                [type]: prev[type].includes(value)
                    ? prev[type].filter(item => item !== value)
                    : [...prev[type], value]
            }))
        }
    }

    const handleAddressSearch = () => {
        if (!window.daum) return alert('주소 서비스 로딩 중입니다.')
        new window.daum.Postcode({
            oncomplete: function (data) {
                let fullAddr = data.address;
                let extraAddr = '';
                if (data.addressType === 'R') {
                    if (data.bname !== '') extraAddr += data.bname;
                    if (data.buildingName !== '') extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
                    fullAddr += (extraAddr !== '' ? ' (' + extraAddr + ')' : '');
                }
                setFormData(prev => ({
                    ...prev,
                    address: fullAddr,
                    location: data.buildingName || prev.location
                }));
            }
        }).open();
    }

    const handlePlaceSearch = async (val) => {
        setPlaceSearchQuery(val);
        if (!val) {
            setPlaceResults([]);
            return;
        }
        try {
            const response = await fetch(`http://localhost:3001/api/search-venue?query=${encodeURIComponent(val)}`);
            const data = await response.json();
            setPlaceResults(data);
        } catch (error) {
            console.error('Search failed:', error);
            setPlaceResults([]);
        }
    }

    const selectPlace = (item) => {
        setFormData(prev => ({
            ...prev,
            location: item.place_name,
            address: item.road_address_name || item.address_name
        }));
        setIsPlaceModalOpen(false);
        setPlaceSearchQuery('');
        setPlaceResults([]);
    }

    const openNaverMap = () => {
        const query = formData.location || formData.address;
        if (query) {
            window.open(`https://map.naver.com/v5/search/${encodeURIComponent(query)}`, '_blank');
        } else {
            alert('장소 또는 주소를 먼저 입력해주세요.');
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault() // [학습 포인트] 폼 제출 시 브라우저가 새로고침되는 것을 막습니다.

        const reservationPayload = {
            ...formData,
            name: `${formData.groomName} & ${formData.brideName}`,
            totalPrice: totalPrice,
            notionPageId: editingId ? reservations.find(r => r.id === editingId)?.notionPageId : null
        }

        if (editingId) {
            updateReservation(editingId, reservationPayload)
            const pageId = reservationPayload.notionPageId
            if (pageId) {
                try {
                    await updateReservationInNotion(pageId, {
                        name: reservationPayload.name,
                        date: formData.weddingDate,
                        time: formData.weddingTime,
                        location: `${formData.location} (${formData.address})`,
                        products: [...formData.products, ...formData.options],
                        totalPrice: totalPrice,
                        memo: formData.memo,
                        groomPhone: formData.groomPhone,
                        bridePhone: formData.bridePhone
                    });
                    alert('예약 정보가 성공적으로 수정되었습니다.');
                } catch (error) {
                    console.error('Notion update failed:', error.message);
                    alert('노션 수정에 실패했습니다.');
                }
            } else {
                alert('연동된 노션 페이지 ID를 찾을 수 없습니다. 로컬 정보만 수정되었습니다.');
            }
        } else {
            const creationId = Date.now()
            addReservation({ ...reservationPayload, id: creationId })
            try {
                const response = await saveReservationToNotion({
                    name: reservationPayload.name,
                    date: formData.weddingDate,
                    time: formData.weddingTime,
                    location: `${formData.location} (${formData.address})`,
                    products: [...formData.products, ...formData.options],
                    totalPrice: totalPrice,
                    memo: formData.memo,
                    groomPhone: formData.groomPhone,
                    bridePhone: formData.bridePhone
                });
                updateReservation(creationId, { ...reservationPayload, notionPageId: response.pageId })
                alert('예약 정보가 노션에 성공적으로 연동되었습니다.');
            } catch (error) {
                console.error('Notion save failed:', error.message);
                alert('노션 연동에 실패했습니다.');
            }
        }
        setEditingId(null)
    }

    const handleReset = () => {
        setEditingId(null)
        setFormData({
            groomName: '', brideName: '', groomPhone: '', bridePhone: '', weddingDate: '', weddingTime: '',
            location: '', address: '', products: [], options: [], checks: [], memo: ''
        })
    }

    const handleEdit = (res) => {
        setEditingId(res.id)
        let parsedGroom = res.groomName || ''
        let parsedBride = res.brideName || ''
        if (!parsedGroom && !parsedBride && res.name) {
            const parts = res.name.split(' & ')
            parsedGroom = parts[0] || ''
            parsedBride = parts[1] || ''
        }
        let parsedLoc = res.location || ''
        let parsedAddr = res.address || ''
        if (!parsedAddr && parsedLoc.includes(' (')) {
            const parts = parsedLoc.split(' (')
            parsedLoc = parts[0]
            parsedAddr = parts[1]?.replace(')', '') || ''
        }
        const allItems = res.products || []
        const parsedProducts = res.products_list || allItems.filter(p => mainProducts.some(mp => mp.name === p))
        const parsedOptions = res.options_list || allItems.filter(o => optionsList.some(ol => ol.name === o))

        setFormData({
            groomName: parsedGroom, brideName: parsedBride, groomPhone: res.groomPhone || '', bridePhone: res.bridePhone || '',
            weddingDate: res.weddingDate || res.date || '', weddingTime: res.weddingTime || res.time || '',
            location: parsedLoc, address: parsedAddr, products: parsedProducts, options: parsedOptions,
            checks: res.checks || [], memo: res.memo || ''
        })
    }

    // Calendar UI Helper Functions
    const currentMonth = viewDate.getMonth()
    const currentYear = viewDate.getFullYear()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const firstDay = new Date(currentYear, currentMonth, 1).getDay()
    const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)

    const handlePrevMonth = () => setViewDate(new Date(currentYear, currentMonth - 1, 1))
    const handleNextMonth = () => setViewDate(new Date(currentYear, currentMonth + 1, 1))
    const handleGoToday = () => {
        const today = new Date()
        setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))
    }

    const handleDateClick = (day) => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        setFormData(prev => ({ ...prev, weddingDate: dateStr }))
        const newDate = new Date(currentYear, currentMonth, day)
        setSelectedDate(newDate)
        setFilterDate(newDate)
        setIsCalendarModalOpen(false) // 날짜 클릭 시 모달 닫기
    }

    const getDayOfWeek = (dateString) => {
        if (!dateString) return ''
        const days = ['일', '월', '화', '수', '목', '금', '토']
        const date = new Date(dateString)
        return days[date.getDay()]
    }

    const onFullCalendarSelect = (date) => {
        handleDateChange(date)
        setIsCalendarModalOpen(false)
    }

    const filteredReservations = reservations.filter(res => {
        if (filterDate) {
            const resDate = res.date || res.weddingDate;
            const filterDateStr = dayjs(filterDate).format('YYYY-MM-DD');
            if (resDate !== filterDateStr) return false;
        }
        const matchesSearch = !searchTerm || (res.name && res.name.toLowerCase().includes(searchTerm.toLowerCase()));
        if (!showAllReservations && !filterDate && !searchTerm) {
            const resDate = res.date || res.weddingDate;
            if (!resDate) return false;
            return dayjs(resDate).format('YYYY-M') === `${currentYear}-${currentMonth + 1}` && matchesSearch;
        }
        return matchesSearch;
    })

    const handleReservationClick = (res) => {
        const dateStr = res.date || res.weddingDate
        if (dateStr) {
            const date = new Date(dateStr)
            setViewDate(new Date(date.getFullYear(), date.getMonth(), 1))
            setSelectedDate(date)
        }
        handleEdit(res)
    }

    const handleCopyText = () => {
        const groom = formData.groomName || '신랑'
        const bride = formData.brideName || '신부'
        const date = formData.weddingDate || '미정'
        const time = formData.weddingTime || '미정'
        const locationName = formData.location || '미정'
        const addressDetail = formData.address ? `(${formData.address})` : ''
        const products = formData.products.length > 0 ? formData.products.join(', ') : '선택 안함'
        const options = formData.options.length > 0 ? formData.options.join(', ') : '선택 안함'

        const selectedProduct = mainProducts.find(p => formData.products.includes(p.name));
        const productDetailText = selectedProduct ? `\n\n[상품 상세 내용]\n${selectedProduct.desc}` : '';

        const text = `
웨딩포토 스페셜리스트 박정훈작가
[본식촬영 예약 안내]

안녕하세요! ${groom} ❤️ ${bride}님.
상담하신 예약 내용 보내드립니다.

📅 일시: ${date} ${time}
📍 장소: ${locationName}
${addressDetail}

[선택 상품]
${products}${productDetailText}

[추가 옵션]
${options}

💰 총 견적: ₩${Number(totalPrice).toLocaleString()}

예식이 있는주에는 최종점검 안내 해피콜을 드립니다.
행복한 결혼 준비 되세요!
감사합니다.
`.trim();

        navigator.clipboard.writeText(text).then(() => {
            alert('예약 내용이 복사되었습니다! 카카오톡 등에 붙여넣기 하세요.');
        }).catch(err => {
            console.error('Copy failed', err)
            alert('복사에 실패했습니다.')
        })
    }


    const handleSaveImage = () => {
        if (!window.html2canvas) {
            alert('이미지 저장 도구가 로딩 중이거나 실패했습니다. 잠시 후 다시 시도해주세요.');
            return;
        }
        const element = document.getElementById('receipt-capture-area');
        if (!element) return;
        window.html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
        }).then(canvas => {
            const link = document.createElement('a');
            const dateStr = formData.weddingDate ? formData.weddingDate.replace(/-/g, '') : 'date';
            link.download = `예약확정_${formData.groomName || '고객'}_${dateStr}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(err => {
            console.error('Image save failed:', err);
            alert('이미지 저장에 실패했습니다.');
        });
    }

    /* 7. 화면 렌더링 (JSX) */
    // [학습 포인트] 여기서부터가 실제 화면에 그려질 HTML 구조(JSX)입니다.
    // { } 중괄호를 통해 위에서 만든 데이터(state)나 함수(handler)를 HTML 요소와 연결합니다.
    return (
        <ConfigProvider locale={locale}>
            <div className="dashboard-container">
                <div className="left-panel">
                    <div className="glass-panel">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <h2 className="section-title" style={{ margin: 0 }}>
                                <FileTextOutlined /> 예약 상담표
                            </h2>
                            <button type="button" onClick={handleReset} className="action-btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                                <PlusOutlined /> 새로 작성
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="reservation-form" style={{ gap: '22px' }} onKeyDown={(e) => { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') e.preventDefault(); }}>
                            {/* Customer Info */}
                            <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '20px' }}>
                                <div className="form-group">
                                    <label>신랑</label>
                                    <input name="groomName" value={formData.groomName} onChange={handleInputChange} placeholder="이름" />
                                </div>
                                <div className="form-group">
                                    <label>연락처</label>
                                    <input name="groomPhone" value={formData.groomPhone} onChange={handleInputChange} maxLength="13" placeholder="010-0000-0000" />
                                </div>
                                <div className="form-group">
                                    <label>신부</label>
                                    <input name="brideName" value={formData.brideName} onChange={handleInputChange} placeholder="이름" />
                                </div>
                                <div className="form-group">
                                    <label>연락처</label>
                                    <input name="bridePhone" value={formData.bridePhone} onChange={handleInputChange} maxLength="13" placeholder="010-0000-0000" />
                                </div>
                            </div>

                            {/* Schedule */}
                            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form-group">
                                    <label>날짜</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <div 
                                            className="custom-picker" 
                                            style={{ 
                                                flex: 1, 
                                                height: '38px', 
                                                borderRadius: '10px', 
                                                border: '1px solid #dfe6e9', 
                                                background: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '0 12px',
                                                cursor: 'pointer',
                                                fontSize: '1rem',
                                                color: formData.weddingDate ? '#333' : '#bfbfbf'
                                            }}
                                            onClick={() => setIsCalendarModalOpen(true)}
                                        >
                                            {formData.weddingDate ? dayjs(formData.weddingDate).format("YYYY-MM-DD") : "날짜 선택"}
                                        </div>
                                        <button type="button" onClick={() => setIsCalendarModalOpen(true)} className="icon-btn-primary" style={{ background: '#6c5ce7' }}>
                                            <CalendarOutlined />
                                        </button>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>시간</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Popover 
                                            trigger="click" 
                                            open={timePickerOpen} 
                                            onOpenChange={setTimePickerOpen}
                                            overlayClassName="time-picker-popover"
                                            content={
                                                <div className="time-picker-container">
                                                    <div className="time-picker-layout">
                                                        {/* 1. Meridiem (Left) */}
                                                        <div className="time-column">
                                                            <span className="time-column-title">구분</span>
                                                            <div className="time-btn-group">
                                                                {['오전', '오후'].map(m => {
                                                                    const currentAMPM = formData.weddingTime ? (dayjs(formData.weddingTime, "HH:mm").hour() < 12 ? '오전' : '오후') : '오후'
                                                                    return (
                                                                        <button 
                                                                            key={m} 
                                                                            className={`time-big-btn meridiem-btn ${currentAMPM === m ? 'active' : ''}`}
                                                                            onClick={() => {
                                                                                const currentH = formData.weddingTime ? dayjs(formData.weddingTime, "HH:mm").hour() : 14
                                                                                const newH = m === '오전' ? (currentH % 12) : (currentH % 12 + 12)
                                                                                const mnt = formData.weddingTime ? dayjs(formData.weddingTime, "HH:mm").minute() : 0
                                                                                handleTimeChange(dayjs().hour(newH).minute(mnt))
                                                                            }}
                                                                        >
                                                                            {m}
                                                                        </button>
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>

                                                        {/* 2. Hours (Middle) */}
                                                        <div className="time-column">
                                                            <span className="time-column-title">시간</span>
                                                            <div className="time-grid">
                                                                {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(h => {
                                                                    const currentH_12 = formData.weddingTime ? dayjs(formData.weddingTime, "HH:mm").hour() % 12 : 2
                                                                    const activeH = (currentH_12 === 0 ? 12 : currentH_12) === h
                                                                    return (
                                                                        <button 
                                                                            key={h} 
                                                                            className={`time-big-btn ${activeH ? 'active' : ''}`}
                                                                            onClick={() => {
                                                                                const isPM = formData.weddingTime ? dayjs(formData.weddingTime, "HH:mm").hour() >= 12 : true
                                                                                let newH = h === 12 ? 0 : h
                                                                                if (isPM) newH += 12
                                                                                const mnt = formData.weddingTime ? dayjs(formData.weddingTime, "HH:mm").minute() : 0
                                                                                handleTimeChange(dayjs().hour(newH).minute(mnt))
                                                                            }}
                                                                        >
                                                                            {h}
                                                                        </button>
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>

                                                        {/* 3. Minutes (Right) */}
                                                        <div className="time-column">
                                                            <span className="time-column-title">분</span>
                                                            <div className="time-btn-group">
                                                                {['00', '30'].map(m => {
                                                                    const currentM = formData.weddingTime ? dayjs(formData.weddingTime, "HH:mm").format('mm') : '00'
                                                                    return (
                                                                        <button 
                                                                            key={m} 
                                                                            className={`time-big-btn minute-btn ${currentM === m ? 'active' : ''}`}
                                                                            onClick={() => {
                                                                                const h = formData.weddingTime ? dayjs(formData.weddingTime, "HH:mm").hour() : 14
                                                                                handleTimeChange(dayjs().hour(h).minute(parseInt(m)))
                                                                            }}
                                                                        >
                                                                            {m}
                                                                        </button>
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <button className="time-confirm-btn" onClick={() => setTimePickerOpen(false)}>확인</button>
                                                </div>
                                            }
                                        >
                                            <div 
                                                className="custom-picker" 
                                                style={{ 
                                                    flex: 1, 
                                                    height: '38px', 
                                                    borderRadius: '10px', 
                                                    border: '1px solid #dfe6e9', 
                                                    background: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    padding: '0 12px',
                                                    cursor: 'pointer',
                                                    fontSize: '1rem',
                                                    color: formData.weddingTime ? '#333' : '#bfbfbf'
                                                }}
                                            >
                                                {formData.weddingTime ? dayjs(formData.weddingTime, "HH:mm").format("A h:mm") : ""}
                                            </div>
                                        </Popover>
                                        <button type="button" onClick={() => setTimePickerOpen(true)} className="icon-btn-primary" style={{ background: '#6c5ce7' }}>
                                            <ClockCircleOutlined />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form-group">
                                    <label>장소</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input name="location" value={formData.location} onChange={handleInputChange} style={{ flex: 1 }} placeholder="" />
                                        <button type="button" onClick={() => setIsPlaceModalOpen(true)} className="icon-btn-primary" style={{ background: '#6c5ce7' }}><BankOutlined /></button>
                                        <button type="button" onClick={openNaverMap} className="icon-btn-secondary"><CompassOutlined /></button>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>주소</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input name="address" value={formData.address} onChange={handleInputChange} style={{ flex: 1 }} placeholder="" />
                                        <button type="button" onClick={handleAddressSearch} className="icon-btn-primary"><SearchOutlined /></button>
                                    </div>
                                </div>
                            </div>

                            <div className="form-sections-container" style={{ display: 'flex', flexDirection: 'column', gap: '28px', marginTop: '30px' }}>
                                <div className="form-section">
                                    <label style={{ display: 'block', fontWeight: 700, fontSize: '1.05rem', marginBottom: '12px' }}>촬영상품</label>
                                    <div className="checkbox-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                                        {/* Row 1: 0, 1 | Row 2: 2, Gap | Row 3: 3, 4 */}
                                        {[...mainProducts.slice(0, 3), { isGap: true }, ...mainProducts.slice(3)].map((p, idx) => {
                                            if (p.isGap) return <div key="gap" className="checkbox-placeholder" />;
                                            return (
                                                <label key={p.name} className="checkbox-item">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={formData.products.includes(p.name)} 
                                                        onChange={() => handleToggle('products', p.name)} 
                                                    />
                                                    <div className="custom-checkbox"></div>
                                                    <span>{p.name} ({p.price.toLocaleString()})</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="form-section">
                                    <label style={{ display: 'block', fontWeight: 700, fontSize: '1.05rem', marginBottom: '12px' }}>추가옵션</label>
                                    <div className="checkbox-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                                        {optionsList.map(o => (
                                            <label key={o.name} className="checkbox-item">
                                                <input type="checkbox" checked={formData.options.includes(o.name)} onChange={() => handleToggle('options', o.name)} />
                                                <div className="custom-checkbox"></div>
                                                <span>{o.name} {o.price > 0 ? `(${o.price.toLocaleString()})` : ''}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-section">
                                    <label style={{ display: 'block', fontWeight: 700, fontSize: '1.05rem', marginBottom: '12px' }}>해피콜</label>
                                    <div className="happy-call-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                                        {checkItems.map(item => (
                                            <div key={item} className="happy-call-item" style={{ padding: '8px 12px' }}>
                                                <span className="happy-call-label" style={{ fontSize: '0.9rem' }}>{item}</span>
                                                <div className="ox-group">
                                                    <button 
                                                        type="button"
                                                        className={`ox-btn ${formData.checks.includes(item) ? 'active-o' : ''}`}
                                                        onClick={() => {
                                                            if (!formData.checks.includes(item)) {
                                                                handleToggle('checks', item);
                                                            }
                                                        }}
                                                    >O</button>
                                                    <button 
                                                        type="button"
                                                        className={`ox-btn ${!formData.checks.includes(item) ? 'active-x' : ''}`}
                                                        onClick={() => {
                                                            if (formData.checks.includes(item)) {
                                                                handleToggle('checks', item);
                                                            }
                                                        }}
                                                    >X</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </form>
                    </div>
                </div>

                <div className="middle-panel">
                    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', paddingBottom: '30px' }}>
                        <h2 className="section-title"><CalendarOutlined /> 캘린더</h2>
                        <div className="calendar-card">
                            <div className="calendar-header">
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <button onClick={handlePrevMonth} className="nav-btn">&lt;</button>
                                    <button onClick={handleGoToday} className="action-btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>오늘</button>
                                </div>
                                <h3>{currentYear}년 {currentMonth + 1}월</h3>
                                <button onClick={handleNextMonth} className="nav-btn">&gt;</button>
                            </div>
                            <div className="calendar-grid">
                                {['일', '월', '화', '수', '목', '금', '토'].map(d => (
                                    <div key={d} className="calendar-day-header">{d}</div>
                                ))}
                                {/* 앞쪽 빈 칸 */}
                                {Array.from({ length: firstDay }).map((_, i) => (
                                    <div key={`empty-start-${i}`} className="calendar-cell empty"></div>
                                ))}
                                {/* 날짜 칸 */}
                                {calendarDays.map(day => {
                                    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                                    const dayEvents = reservations.filter(r => (r.date || r.weddingDate) === dateStr)
                                    const hasEvent = dayEvents.length > 0
                                    const isSelected = selectedDate && selectedDate.getFullYear() === currentYear && selectedDate.getMonth() === currentMonth && selectedDate.getDate() === day
                                    const holidayName = holidays[dateStr];
                                    const isHoliday = !!holidayName;
                                    const isSunday = new Date(currentYear, currentMonth, day).getDay() === 0;

                                    return (
                                        <div key={day} className={`calendar-cell ${hasEvent ? 'has-event' : ''} ${isSelected ? 'active' : ''}`} onClick={() => handleDateClick(day)}>
                                            <span className="day-number" style={{ color: (isHoliday || isSunday) ? '#e17055' : undefined }}>{day}</span>
                                            {holidayName && <div style={{ fontSize: '0.6rem', color: '#e17055', overflow: 'hidden' }}>{holidayName}</div>}
                                            {hasEvent && <span className="event-count">{dayEvents.length}</span>}
                                        </div>
                                    )
                                })}
                                {/* 뒤쪽 빈 칸 (항상 6줄을 유지하도록 함) */}
                                {Array.from({ length: 42 - (firstDay + daysInMonth) }).map((_, i) => (
                                    <div key={`empty-end-${i}`} className="calendar-cell empty"></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
                        <button type="button" className="action-btn-secondary" style={{ flex: 1, padding: '12px' }} onClick={handleCopyText}><CopyOutlined /> 복사</button>
                        <button type="button" className="action-btn-secondary" style={{ flex: 1, padding: '12px' }} onClick={handleSaveImage}><FileImageOutlined /> 저장</button>
                        <button type="button" className="action-btn-secondary" style={{ flex: 1, padding: '12px' }} onClick={() => setIsPreviewOpen(true)}><EyeOutlined /> 미리보기</button>
                    </div>

                    <div className="price-summary">
                        <span className="price-label">최종 견적 금액</span>
                        <span className="price-value">₩ {totalPrice.toLocaleString()}</span>
                    </div>

                    <button type="button" onClick={() => handleSubmit({ preventDefault: () => { } })} className="submit-btn">
                        {editingId ? '수정 완료' : '예약 등록'}
                    </button>
                    <div style={{ height: '10px' }} />
                </div>

                <div className="right-panel">
                    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ flex: 'none' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h2 className="section-title" style={{ margin: 0, fontSize: '1.4rem' }}>
                                    <CheckCircleOutlined /> 예약 목록 ({filteredReservations.length})
                                </h2>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => setShowAllReservations(!showAllReservations)} className="action-btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                                        {showAllReservations ? '월별' : '전체'}
                                    </button>
                                    {filterDate && <button onClick={() => setFilterDate(null)} className="action-btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem', background: '#ff7675', color: 'white' }}>해제</button>}
                                </div>
                            </div>
                            <input type="text" placeholder="고객 이름 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="place-search-input" style={{ width: '100%', marginBottom: '10px', padding: '10px' }} />
                        </div>
                        
                        {/* 예약 목록 4개 노출 고정 */}
                        <div className="reservation-list">
                            {filteredReservations.length > 0 ? (
                                filteredReservations.map(res => (
                                    <div key={res.id} className="reservation-card" onClick={() => handleReservationClick(res)} style={{ padding: '12px' }}>
                                        <div className="reservation-info">
                                            <h4 style={{ fontSize: '1rem', margin: '0 0 4px 0' }}>{res.name}</h4>
                                            <p style={{ fontSize: '0.8rem', margin: 0, color: '#666' }}>{res.date || res.weddingDate} {res.time || res.weddingTime}</p>
                                            <p style={{ fontSize: '0.8rem', margin: 0, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{res.location}</p>
                                        </div>
                                        <div style={{ textAlign: 'right', flex: 'none' }}>
                                            <div style={{ fontWeight: 'bold', color: '#ff4081', fontSize: '0.9rem' }}>₩{res.totalPrice.toLocaleString()}</div>
                                            <div style={{ marginTop: '5px' }}>
                                                <EditOutlined onClick={(e) => { e.stopPropagation(); handleEdit(res); }} style={{ marginRight: '10px', color: '#6c5ce7' }} />
                                                <DeleteOutlined onClick={(e) => { e.stopPropagation(); removeReservation(res.id); }} style={{ color: '#ff7675' }} />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>예약 내역이 없습니다.</div>
                            )}
                        </div>

                        {/* 상담메모 아래로 꽉 차게 변경 */}
                        <div className="form-section" style={{ marginTop: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <label style={{ display: 'block', fontWeight: 700, fontSize: '1.05rem', marginBottom: '10px' }}>상담메모</label>
                            <textarea 
                                name="memo" 
                                value={formData.memo} 
                                onChange={handleInputChange} 
                                className="memo-textarea" 
                                style={{ width: '100%', flex: 1, fontSize: '1rem', padding: '12px', minHeight: '150px' }} 
                                placeholder="메모를 입력하세요"
                            ></textarea>
                        </div>
                    </div>
                </div>
            </div>

            <Modal 
                title={null} 
                open={isCalendarModalOpen} 
                onCancel={() => setIsCalendarModalOpen(false)} 
                footer={null} 
                width={800}
                centered
                bodyStyle={{ padding: '0' }}
            >
                <div className="simple-calendar-container">
                    <div className="simple-calendar-header" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px', padding: '15px 0' }}>
                        <button onClick={handlePrevMonth} className="action-btn-secondary">
                            <LeftOutlined /> 이전
                        </button>
                        <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>{currentYear}년 {currentMonth + 1}월</h3>
                        <button onClick={handleNextMonth} className="action-btn-secondary">
                            다음 <RightOutlined />
                        </button>
                    </div>
                    
                    <div className="simple-calendar-grid">
                        {['일', '월', '화', '수', '목', '금', '토'].map(d => (
                            <div key={d} className="calendar-weekday">{d}</div>
                        ))}
                        
                        {/* 앞쪽 빈 칸 */}
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="simple-calendar-day empty"></div>
                        ))}
                        
                        {/* 날짜들 */}
                        {calendarDays.map(day => {
                            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                            const hasEvent = reservations.some(r => (r.date || r.weddingDate) === dateStr)
                            const isSelected = formData.weddingDate === dateStr
                            const isToday = dayjs().format('YYYY-MM-DD') === dateStr
                            const dayOfWeek = new Date(currentYear, currentMonth, day).getDay()
                            
                            return (
                                <div 
                                    key={day} 
                                    className={`simple-calendar-day ${isSelected ? 'active' : ''} ${isToday ? 'today' : ''} ${dayOfWeek === 0 ? 'sunday' : ''} ${dayOfWeek === 6 ? 'saturday' : ''}`}
                                    onClick={() => handleDateClick(day)}
                                >
                                    <span className="day-num">{day}</span>
                                    {hasEvent && <div className="event-dot" />}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </Modal>

            <Modal title="장소 검색" open={isPlaceModalOpen} onCancel={() => setIsPlaceModalOpen(false)} footer={null} width={500}>
                <input autoFocus placeholder="검색어 입력" value={placeSearchQuery} onChange={(e) => handlePlaceSearch(e.target.value)} className="place-search-input" style={{ width: '100%', marginBottom: '15px' }} />
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {placeResults.map(item => (
                        <div key={item.id} className="place-item" onClick={() => selectPlace(item)}>
                            <div className="place-name">{item.place_name}</div>
                            <div className="place-addr">{item.road_address_name || item.address_name}</div>
                        </div>
                    ))}
                </div>
            </Modal>

            <Modal title="예약 상담표 미리보기" open={isPreviewOpen} onCancel={() => setIsPreviewOpen(false)} footer={null} width={1000}>
                <div style={{ display: 'flex', justifyContent: 'center', background: '#f5f5f5', padding: '20px' }}>
                    <ReceiptTemplate formData={formData} totalPrice={totalPrice} />
                </div>
            </Modal>

            <div id="receipt-capture-area" style={{ position: 'fixed', left: '-9999px', top: 0 }}>
                <ReceiptTemplate formData={formData} totalPrice={totalPrice} />
            </div>
        </ConfigProvider>
    )
}

export default Home
