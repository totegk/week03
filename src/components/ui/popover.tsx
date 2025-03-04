'use client'

import React, { ReactNode } from 'react';

interface PopoverProps {
    children: ReactNode;
}

export function Popover({ children }: PopoverProps) {
    return <div className="relative inline-block">{children}</div>;
}

interface PopoverTriggerProps {
    children: ReactNode;
    asChild?: boolean;
}

export function PopoverTrigger({ children }: PopoverTriggerProps) {
    return <>{children}</>;
}

interface PopoverContentProps {
    children: ReactNode;
    className?: string;
}

export function PopoverContent({ children, className }: PopoverContentProps) {
    return <div className={className}>{children}</div>;
} 