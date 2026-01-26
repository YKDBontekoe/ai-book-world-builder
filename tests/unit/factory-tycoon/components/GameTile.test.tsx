import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GameTile from '@/features/factory-tycoon/components/GameTile';
import { BuildingEntity } from '@/features/factory-tycoon/types';

// Mock dependencies
vi.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

vi.mock('@/components/atoms/tooltip', () => ({
  Tooltip: ({ children }: { children: any }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: any }) => <div>{children}</div>,
  TooltipContent: ({ children }: { children: any }) => <div data-testid="tooltip-content">{children}</div>,
  TooltipProvider: ({ children }: { children: any }) => <div>{children}</div>,
}));

// Mock visuals
vi.mock('@/features/factory-tycoon/components/visuals', () => ({
  ICONS: {
    Mine: () => <svg data-testid="icon-mine" />,
    Belt: () => <svg data-testid="icon-belt" />,
  },
  STATUS_CONFIG: {
    RUNNING: { Icon: () => <svg data-testid="status-running" />, className: 'status-running', color: 'green' },
    BLOCKED: { Icon: () => <svg data-testid="status-blocked" />, className: 'status-blocked', color: 'red' },
    IDLE: { Icon: null, className: 'status-idle', color: 'gray' },
  },
  BUILDING_COLORS: {
    Mine: 'text-amber-600',
  },
  getRotation: () => 0,
}));

vi.mock('@/features/factory-tycoon/config', () => ({
  BUILDINGS: {
    Mine: { type: 'Mine', description: 'A Mine' },
    Belt: { type: 'Belt', description: 'A Belt' },
  },
}));

describe('GameTile', () => {
  const defaultProps = {
    x: 0,
    y: 0,
    building: undefined,
    selectedBuilding: null,
    currentDirection: 'N',
    isHovered: false,
    onInteract: vi.fn(),
    onContext: vi.fn(),
    onHover: vi.fn(),
  };

  it('renders empty tile', () => {
    render(<GameTile {...defaultProps} />);
    const tile = screen.getByText((content, element) => {
        return element?.classList.contains('factory-tile');
    });
    expect(tile).toBeDefined();
  });

  it('renders building icon when building exists', () => {
    const building: BuildingEntity = {
      id: '1',
      type: 'Mine',
      x: 0,
      y: 0,
      status: 'RUNNING',
      direction: 'N',
    };
    render(<GameTile {...defaultProps} building={building} />);
    expect(screen.getByTestId('icon-mine')).toBeDefined();
    // Status Icon is not shown for RUNNING, only indicator dot (which is a div)
    // We can check for the dot class or change status to BLOCKED to see the icon
  });

  it('renders status icon when blocked', () => {
    const building: BuildingEntity = {
      id: '1',
      type: 'Mine',
      x: 0,
      y: 0,
      status: 'BLOCKED',
      direction: 'N',
    };
    render(<GameTile {...defaultProps} building={building} />);
    expect(screen.getByTestId('status-blocked')).toBeDefined();
  });

  it('calls onInteract when clicked', () => {
    render(<GameTile {...defaultProps} />);
    const tile = screen.getByText((content, element) => {
        return element?.classList.contains('factory-tile');
    });
    fireEvent.click(tile);
    expect(defaultProps.onInteract).toHaveBeenCalledWith(0, 0);
  });

  it('calls onHover when mouse enters', () => {
      render(<GameTile {...defaultProps} />);
      const tile = screen.getByText((content, element) => {
          return element?.classList.contains('factory-tile');
      });
      fireEvent.mouseEnter(tile);
      expect(defaultProps.onHover).toHaveBeenCalledWith({ x: 0, y: 0 });
  });
});
