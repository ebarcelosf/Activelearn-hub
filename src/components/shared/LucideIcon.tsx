import React from 'react';
import { icons, LucideProps, HelpCircle } from 'lucide-react';

interface LucideIconProps extends Omit<LucideProps, 'ref'> {
  name: keyof typeof icons;
}

export const LucideIcon: React.FC<LucideIconProps> = ({ name, ...props }) => {
  const IconComponent = icons[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in lucide-react`);
    return <HelpCircle {...props} />;
  }
  
  return <IconComponent {...props} />;
};