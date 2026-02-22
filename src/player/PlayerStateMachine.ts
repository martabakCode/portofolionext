/**
 * PlayerStateMachine - Finite State Machine for Player States
 * 
 * Architecture Pattern: State Pattern
 * Purpose: Encapsulate state-specific behavior and transitions
 * 
 * States:
 * - IDLE: Not moving
 * - WALK: Moving at normal speed
 * - RUN: Moving at sprint speed
 * - INTERACT: Performing interaction animation
 * 
 * Benefits:
 * - Clean separation of state logic
 * - Easy to add new states
 * - Prevents invalid state transitions
 */

import { PlayerState, PlayerInput } from '@/types/game';
import { eventBus } from '@/core/EventBus';

// State transition configuration
interface StateConfig {
  canEnter: (from: PlayerState, input: PlayerInput) => boolean;
  onEnter?: (from: PlayerState) => void;
  onExit?: (to: PlayerState) => void;
}

class PlayerStateMachine {
  private currentState: PlayerState = PlayerState.IDLE;
  private previousState: PlayerState = PlayerState.IDLE;
  private stateTime: number = 0; // Time spent in current state

  // State configurations with entry/exit hooks
  private stateConfigs: Record<PlayerState, StateConfig> = {
    [PlayerState.IDLE]: {
      canEnter: () => true,
      onEnter: () => {
        // console.log('[StateMachine] Entered IDLE');
      },
    },
    [PlayerState.WALK]: {
      canEnter: (from, input) => this.isMoving(input) && !input.sprint,
      onEnter: () => {
        // console.log('[StateMachine] Entered WALK');
      },
    },
    [PlayerState.RUN]: {
      canEnter: (from, input) => this.isMoving(input) && input.sprint,
      onEnter: () => {
        // console.log('[StateMachine] Entered RUN');
      },
    },
    [PlayerState.INTERACT]: {
      canEnter: (from) => from !== PlayerState.INTERACT,
      onEnter: () => {
        // console.log('[StateMachine] Entered INTERACT');
      },
    },
    [PlayerState.JUMP]: {
      canEnter: (from) => from !== PlayerState.JUMP && from !== PlayerState.INTERACT,
      onEnter: () => {
        // console.log('[StateMachine] Entered JUMP');
      },
    },
  };

  /**
   * Check if any movement keys are pressed
   */
  private isMoving(input: PlayerInput): boolean {
    return input.forward || input.backward || input.left || input.right;
  }

  /**
   * Get current state
   */
  getState(): PlayerState {
    return this.currentState;
  }

  /**
   * Get previous state
   */
  getPreviousState(): PlayerState {
    return this.previousState;
  }

  /**
   * Get time spent in current state
   */
  getStateTime(): number {
    return this.stateTime;
  }

  /**
   * Force set state (use with caution)
   */
  setState(newState: PlayerState): boolean {
    if (newState === this.currentState) return false;

    const oldState = this.currentState;

    // Exit current state
    this.stateConfigs[oldState]?.onExit?.(newState);

    // Transition
    this.previousState = oldState;
    this.currentState = newState;
    this.stateTime = 0;

    // Enter new state
    this.stateConfigs[newState]?.onEnter?.(oldState);

    // Emit event
    eventBus.emit('player:stateChange', {
      from: oldState,
      to: newState,
    });

    return true;
  }

  /**
   * Update state machine based on input
   * Called every frame
   */
  update(deltaTime: number, input: PlayerInput): void {
    this.stateTime += deltaTime;

    // Determine target state based on input
    let targetState = this.currentState;

    if (input.interact && this.currentState !== PlayerState.INTERACT) {
      targetState = PlayerState.INTERACT;
    } else if (this.isMoving(input)) {
      targetState = input.sprint ? PlayerState.RUN : PlayerState.WALK;
    } else if (this.currentState !== PlayerState.INTERACT) {
      targetState = PlayerState.IDLE;
    }

    // Check if we can transition to target state
    if (targetState !== this.currentState) {
      const config = this.stateConfigs[targetState];
      if (config.canEnter(this.currentState, input)) {
        this.setState(targetState);
      }
    }

    // Auto-exit interact state after animation
    if (this.currentState === PlayerState.INTERACT && this.stateTime > 0.5) {
      this.setState(PlayerState.IDLE);
    }
  }

  /**
   * Check if currently in a specific state
   */
  isInState(state: PlayerState): boolean {
    return this.currentState === state;
  }

  /**
   * Check if can move (not in interact state)
   */
  canMove(): boolean {
    return this.currentState !== PlayerState.INTERACT;
  }

  /**
   * Get movement speed based on current state
   */
  getMovementSpeed(walkSpeed: number, runSpeed: number): number {
    switch (this.currentState) {
      case PlayerState.RUN:
        return runSpeed;
      case PlayerState.WALK:
        return walkSpeed;
      default:
        return 0;
    }
  }

  /**
   * Reset to idle state
   */
  reset(): void {
    this.previousState = this.currentState;
    this.currentState = PlayerState.IDLE;
    this.stateTime = 0;
  }
}

export { PlayerStateMachine };
