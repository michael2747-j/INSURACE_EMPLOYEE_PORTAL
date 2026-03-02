import { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { LucideIcon } from 'lucide-react';
import { Card } from './ui/card';


interface KPICardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export function KPICard({ title, value, prefix = '', suffix = '', icon: Icon, trend, onClick }: KPICardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        className={`p-6 bg-gradient-to-br from-slate-50 to-white border-slate-200 ${
          onClick ? 'cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all duration-300' : ''
        }`}
        onClick={onClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-slate-600 mb-2">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-semibold text-slate-900">
                {prefix}
                {displayValue.toLocaleString()}
                {suffix}
              </h3>
              {trend && (
                <span
                  className={`text-sm ${
                    trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
              )}
            </div>
          </div>
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg">
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        {onClick && (
          <div className="mt-4 text-xs text-slate-500">
            Click to view details →
          </div>
        )}
      </Card>
    </motion.div>
  );
}
