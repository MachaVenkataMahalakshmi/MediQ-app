import { useEffect, useState } from 'react';
import { X, MapPin, Star, Clock, Phone, Activity, User, Calendar, CheckCircle2, Users, Timer, AlertCircle, Stethoscope } from 'lucide-react';
import type { Hospital, Department, BookedToken } from '@/types';
import {
  getOpenStatus, statusColor, tokensLeft, peopleAhead, estimatedWaitTime,
  estimatedClockTime, doctorStatusColor, timeSlots, validateName, validatePhone,
  formatDistance, getCrowdLevel, crowdColor,
} from '@/utils';

interface HospitalModalProps {
  hospital: Hospital;
  distance: number;
  onClose: () => void;
  onBook: (token: BookedToken) => void;
  existingTokens: BookedToken[];
  allHospitals: Hospital[];
  onSuggest: (hospitalId: string) => void;
}

type ModalView = 'detail' | 'book' | 'success';

export function HospitalModal({
  hospital, distance, onClose, onBook, existingTokens, allHospitals, onSuggest,
}: HospitalModalProps) {
  const [view, setView] = useState<ModalView>('detail');
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string; slot?: string }>({});
  const [bookedToken, setBookedToken] = useState<BookedToken | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 5000);
    return () => clearInterval(interval);
  }, []);

  const status = getOpenStatus(hospital, now);
  const crowd = getCrowdLevel(hospital, now);

  const alreadyBooked = (dept: Department) =>
    existingTokens.some(
      (t) => t.hospitalId === hospital.id && t.departmentName === dept.name,
    );

  const handleSelectDept = (dept: Department) => {
    setSelectedDept(dept);
    setSelectedSlot('');
    setErrors({});
    setView('book');
  };

  const handleBook = () => {
    if (!selectedDept) return;
    const newErrors: typeof errors = {};
    if (!validateName(name)) newErrors.name = 'Please enter a valid name (min 2 characters)';
    if (!validatePhone(phone)) newErrors.phone = 'Please enter a valid phone number (10-15 digits)';
    if (!selectedSlot) newErrors.slot = 'Please select a time slot';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const tokenNumber = selectedDept.tokensBooked + 1;
    const ahead = peopleAhead(selectedDept, tokenNumber);
    const eta = estimatedClockTime(ahead, now);

    const token: BookedToken = {
      id: `${hospital.id}-${selectedDept.name}-${Date.now()}`,
      tokenNumber,
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      departmentName: selectedDept.name,
      doctor: selectedDept.doctor,
      patientName: name.trim(),
      patientPhone: phone.trim(),
      peopleAhead: ahead,
      estimatedTime: eta,
      bookedAt: Date.now(),
      lat: hospital.lat,
      lng: hospital.lng,
      distance,
      address: hospital.address,
      phone: hospital.phone,
      slot: selectedSlot,
    };

    setBookedToken(token);
    onBook(token);
    setView('success');
  };

  const findSuggestion = () => {
    if (!selectedDept) return null;
    const sorted = allHospitals
      .filter((h) => h.id !== hospital.id)
      .map((h) => ({ h, dist: distance }))
      .filter(({ h }) => {
        const dept = h.departments.find((d) => d.name === selectedDept.name);
        return dept && getOpenStatus(h, now) === 'Open' && tokensLeft(dept) > 0;
      });
    sorted.sort((a, b) => a.dist - b.dist);
    return sorted.length > 0 ? sorted[0].h : null;
  };

  const suggestion = view === 'book' && selectedDept ? findSuggestion() : null;
  const isFull = selectedDept ? tokensLeft(selectedDept) <= 0 : false;
  const isUnavailable = selectedDept ? selectedDept.doctorStatus !== 'Available' : false;
  const canBook = !isFull && !isUnavailable && !alreadyBooked(selectedDept!);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-start justify-between z-10">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-800 truncate">{hospital.name}</h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{hospital.address}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors flex-shrink-0">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Detail View */}
        {view === 'detail' && (
          <div className="p-5 space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`px-2.5 py-1 rounded-lg border font-semibold ${statusColor(status)}`}>{status}</span>
              <span className={`px-2 py-0.5 rounded-md font-medium ${hospital.type === 'Emergency' ? 'bg-red-50 text-red-600' : hospital.type === 'Hospital' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>{hospital.type}</span>
              {hospital.is24x7 && <span className="flex items-center gap-1 text-teal-600 font-medium"><Activity className="w-3 h-3" /> 24x7</span>}
              <span className="flex items-center gap-0.5 text-amber-500 font-semibold"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{hospital.rating.toFixed(1)}</span>
              <span className="text-slate-500 font-medium">{formatDistance(distance)}</span>
              <span className={`px-2 py-0.5 rounded-md font-medium ${crowdColor(crowd)}`}>{crowd} crowd</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>{hospital.is24x7 ? 'Open 24 hours, 7 days a week' : `Hours: ${hospital.openHours}`}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="w-4 h-4 text-teal-600" />
              <a href={`tel:${hospital.phone}`} className="hover:text-teal-700 transition-colors">{hospital.phone}</a>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  Departments & Availability
                </h3>
                <span className="flex items-center gap-1 text-xs text-teal-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" /> Live
                </span>
              </div>
              <div className="space-y-3">
                {hospital.departments.map((dept) => {
                  const left = tokensLeft(dept);
                  const pct = dept.totalTokens > 0 ? (left / dept.totalTokens) * 100 : 0;
                  const booked = alreadyBooked(dept);
                  const disabled = left <= 0 || dept.doctorStatus !== 'Available' || status !== 'Open' || booked;
                  return (
                    <div key={dept.name} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-semibold text-slate-800 text-sm">{dept.name}</h4>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <User className="w-3 h-3" /> {dept.doctor}
                          </p>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${doctorStatusColor(dept.doctorStatus)}`}>
                          {dept.doctorStatus}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-2 text-center">
                        <div className="bg-white rounded-lg py-1.5">
                          <p className="text-[10px] text-slate-400">Tokens Left</p>
                          <p className="text-sm font-bold text-slate-700">{left}/{dept.totalTokens}</p>
                        </div>
                        <div className="bg-white rounded-lg py-1.5">
                          <p className="text-[10px] text-slate-400">Now Serving</p>
                          <p className="text-sm font-bold text-teal-600">#{dept.currentToken}</p>
                        </div>
                        <div className="bg-white rounded-lg py-1.5">
                          <p className="text-[10px] text-slate-400">Wait</p>
                          <p className="text-sm font-bold text-slate-700">{estimatedWaitTime(peopleAhead(dept, dept.currentToken + 1))}</p>
                        </div>
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-3">
                        <div className={`h-full rounded-full ${pct > 50 ? 'bg-emerald-500' : pct > 20 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                      </div>
                      <button
                        onClick={() => handleSelectDept(dept)}
                        disabled={disabled}
                        className={`w-full py-2 rounded-xl text-sm font-semibold transition-all ${
                          disabled
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'
                        }`}
                      >
                        {booked ? 'Already Booked' : left <= 0 ? 'Tokens Full' : dept.doctorStatus !== 'Available' ? 'Doctor Unavailable' : status !== 'Open' ? 'Hospital Closed' : 'Book Token'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Booking View */}
        {view === 'book' && selectedDept && (
          <div className="p-5 space-y-5">
            <button onClick={() => setView('detail')} className="text-sm text-slate-500 hover:text-slate-700 font-medium">
              ← Back to departments
            </button>
            <div className="bg-teal-50 rounded-2xl p-4 border border-teal-100">
              <h3 className="font-bold text-slate-800">{selectedDept.name}</h3>
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-1"><User className="w-3 h-3" /> {selectedDept.doctor}</p>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className={`px-2 py-0.5 rounded-md font-semibold ${doctorStatusColor(selectedDept.doctorStatus)}`}>{selectedDept.doctorStatus}</span>
                <span className="text-slate-600">Tokens left: <strong className="text-slate-800">{tokensLeft(selectedDept)}</strong></span>
                <span className="text-slate-600">Now serving: <strong className="text-teal-600">#{selectedDept.currentToken}</strong></span>
              </div>
            </div>

            {!canBook && (
              <div className="space-y-3">
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-amber-800">
                      {isFull ? 'Tokens are full for this department' : 'Doctor is currently unavailable'}
                    </p>
                    <p className="text-amber-700 mt-1">You can join a waitlist or try the next best option.</p>
                  </div>
                </div>
                <button className="w-full py-2.5 rounded-xl text-sm font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" /> Join Waitlist
                </button>
                {suggestion && (
                  <button
                    onClick={() => { onSuggest(suggestion.id); }}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold bg-teal-600 text-white hover:bg-teal-700 transition-all flex items-center justify-center gap-2"
                  >
                    <MapPin className="w-4 h-4" /> Suggest next best: {suggestion.name}
                  </button>
                )}
                {!suggestion && (
                  <p className="text-center text-xs text-slate-400">No other open hospitals with available tokens found for this department.</p>
                )}
              </div>
            )}

            {canBook && (
              <>
                <div>
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5 mb-2">
                    <Calendar className="w-4 h-4 text-teal-600" /> Select Time Slot
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots().map((slot) => {
                      const [h] = slot.split(':').map(Number);
                      const isPast = h < now.getHours();
                      return (
                        <button
                          key={slot}
                          onClick={() => { setSelectedSlot(slot); setErrors((e) => ({ ...e, slot: undefined })); }}
                          disabled={isPast}
                          className={`py-2 rounded-xl text-xs font-medium transition-all ${
                            selectedSlot === slot
                              ? 'bg-teal-600 text-white'
                              : isPast
                                ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                                : 'bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-700'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                  {errors.slot && <p className="text-xs text-red-500 mt-1">{errors.slot}</p>}
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setErrors((er) => ({ ...er, name: undefined })); }}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                      errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
                    }`}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setErrors((er) => ({ ...er, phone: undefined })); }}
                    placeholder="e.g. +91 98765 43210"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                      errors.phone ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
                    }`}
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>

                <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1"><Timer className="w-4 h-4 text-teal-600" /> Estimated wait</span>
                  <span className="font-bold text-slate-700">{estimatedWaitTime(peopleAhead(selectedDept, selectedDept.tokensBooked + 1))}</span>
                </div>

                <button
                  onClick={handleBook}
                  className="w-full py-3 rounded-xl text-sm font-bold bg-teal-600 text-white hover:bg-teal-700 transition-all shadow-sm"
                >
                  Confirm Booking
                </button>
              </>
            )}
          </div>
        )}

        {/* Success View */}
        {view === 'success' && bookedToken && (
          <div className="p-5 space-y-5">
            <div className="text-center pt-2">
              <div className="w-14 h-14 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Booking Confirmed!</h3>
              <p className="text-sm text-slate-500 mt-1">Your token has been booked successfully.</p>
            </div>

            <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-teal-100 text-xs font-medium">Token Number</p>
                  <p className="text-3xl font-bold">#{bookedToken.tokenNumber}</p>
                </div>
                {/* Decorative QR-style block */}
                <div className="w-16 h-16 bg-white rounded-lg p-1.5 flex-shrink-0">
                  <div className="w-full h-full grid grid-cols-6 gap-px">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div key={i} className={Math.random() > 0.45 ? 'bg-teal-800' : 'bg-white'} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 text-sm border-t border-teal-400/30 pt-3">
                <div className="flex justify-between"><span className="text-teal-100">Hospital</span><span className="font-medium text-right">{bookedToken.hospitalName}</span></div>
                <div className="flex justify-between"><span className="text-teal-100">Department</span><span className="font-medium">{bookedToken.departmentName}</span></div>
                <div className="flex justify-between"><span className="text-teal-100">Doctor</span><span className="font-medium">{bookedToken.doctor}</span></div>
                <div className="flex justify-between"><span className="text-teal-100">Slot</span><span className="font-medium">{bookedToken.slot}</span></div>
                <div className="flex justify-between"><span className="text-teal-100">Est. time</span><span className="font-medium">{bookedToken.estimatedTime}</span></div>
                <div className="flex justify-between"><span className="text-teal-100">People ahead</span><span className="font-medium">{bookedToken.peopleAhead}</span></div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
