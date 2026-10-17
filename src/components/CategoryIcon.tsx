import React from 'react';
import {
  ShieldAlert,
  Monitor,
  Zap,
  Wrench,
  Trophy,
  Utensils,
  FileText,
  CreditCard,
  Bus,
  Droplet,
  HelpCircle,
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5' }) => {
  switch (name) {
    case 'ShieldAlert':
      return <ShieldAlert className={className} />;
    case 'Monitor':
      return <Monitor className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    case 'Wrench':
      return <Wrench className={className} />;
    case 'Trophy':
      return <Trophy className={className} />;
    case 'Utensils':
      return <Utensils className={className} />;
    case 'FileText':
      return <FileText className={className} />;
    case 'CreditCard':
      return <CreditCard className={className} />;
    case 'Bus':
      return <Bus className={className} />;
    case 'Droplet':
      return <Droplet className={className} />;
    default:
      return <HelpCircle className={className} />;
  }
};
