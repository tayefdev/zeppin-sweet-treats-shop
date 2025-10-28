import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: Date;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 md:p-4 min-w-[60px] md:min-w-[80px]">
        <span className="text-2xl md:text-4xl font-bold text-rose-600">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs md:text-sm font-medium text-gray-700 mt-2 uppercase">
        {label}
      </span>
    </div>
  );

  return (
    <div className="bg-gradient-to-r from-rose-100 via-pink-50 to-amber-50 py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h3 className="text-2xl md:text-3xl font-serif text-gray-800 mb-2 italic">
            Special Offer Ends In
          </h3>
          <p className="text-gray-600 text-sm md:text-base">
            Hurry! Don't miss out on amazing deals
          </p>
        </div>
        
        <div className="flex justify-center items-center gap-3 md:gap-6">
          <TimeUnit value={timeLeft.days} label="Days" />
          <span className="text-2xl md:text-4xl text-rose-600 font-bold">:</span>
          <TimeUnit value={timeLeft.hours} label="Hours" />
          <span className="text-2xl md:text-4xl text-rose-600 font-bold">:</span>
          <TimeUnit value={timeLeft.minutes} label="Minutes" />
          <span className="text-2xl md:text-4xl text-rose-600 font-bold">:</span>
          <TimeUnit value={timeLeft.seconds} label="Seconds" />
        </div>
      </div>
    </div>
  );
};
