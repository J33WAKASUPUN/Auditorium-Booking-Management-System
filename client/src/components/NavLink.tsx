// filepath: client/src/components/NavLink.tsx
import { NavLink as RouterNavLink, NavLinkProps } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const NavLink = ({ className, ...props }: NavLinkProps) => {
  return (
    <RouterNavLink
      className={({ isActive }) =>
        cn(
          className,
          isActive ? 'active' : ''
        )
      }
      {...props}
    />
  );
};