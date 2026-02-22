import { Vector3 } from 'three';
import { PlayerInput, PlayerConfig } from '@/types/game';
import { PlayerStateMachine } from './PlayerStateMachine';
import { gameManager } from '@/core/GameManager';
import { TerrainSystem } from '@/core/systems/TerrainSystem';

// Default configuration
const DEFAULT_CONFIG: PlayerConfig = {
  walkSpeed: 5,
  runSpeed: 10,
  rotationSpeed: 10,
  cameraHeight: 2,
  cameraDistance: 8,
  jumpForce: 5,
  gravity: -9.8,
};

class PlayerController {
  private config: PlayerConfig;
  private stateMachine: PlayerStateMachine;

  // Physics State
  private position: Vector3;
  private velocity: Vector3 = new Vector3();
  private rotation: number = 0;
  private isGrounded: boolean = false;

  // Input state
  private input: PlayerInput = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
    interact: false,
    jump: false,
  };

  // Input listeners (for cleanup)
  private keyListeners: { key: string; handler: (e: KeyboardEvent) => void }[] = [];

  constructor(
    startPosition: Vector3 = new Vector3(0, 2, 20),
    config: Partial<PlayerConfig> = {}
  ) {
    this.position = startPosition.clone();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.stateMachine = new PlayerStateMachine();
  }

  /**
   * Initialize input listeners
   */
  initialize(): void {
    this.setupKeyboardListeners();
    console.log('[PlayerController] Initialized');
  }

  /**
   * Setup keyboard event listeners
   */
  private setupKeyboardListeners(): void {
    const keyMap: Record<string, keyof PlayerInput> = {
      'w': 'forward', 'W': 'forward', 'ArrowUp': 'forward',
      's': 'backward', 'S': 'backward', 'ArrowDown': 'backward',
      'a': 'left', 'A': 'left', 'ArrowLeft': 'left',
      'd': 'right', 'D': 'right', 'ArrowRight': 'right',
      'Shift': 'sprint',
      'e': 'interact', 'E': 'interact',
      ' ': 'jump', // Space
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const inputKey = keyMap[e.key];
      if (inputKey) {
        if (inputKey === 'interact' && !this.input.interact) {
          this.triggerInteraction();
        }
        if (inputKey === 'jump') {
          // Jump instant trigger logic if needed, currently handled in loop
        }
        this.input[inputKey] = true;
      }

      // Debug toggle
      if (e.key === '`' || e.key === '~') {
        gameManager.toggleDebugMode();
      }

      // Time of day cycle
      if (e.key === 't' || e.key === 'T') {
        gameManager.cycleTimeOfDay?.();
      }

      // Save game
      if (e.key === 'F5') {
        e.preventDefault();
        gameManager.handleSave?.();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const inputKey = keyMap[e.key];
      if (inputKey && inputKey !== 'interact') {
        this.input[inputKey] = false;
      }
      if (inputKey === 'interact') {
        this.input.interact = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Store for cleanup
    this.keyListeners = [
      { key: 'keydown', handler: handleKeyDown },
      { key: 'keyup', handler: handleKeyUp },
    ];
  }

  /**
   * Trigger interaction via GameManager
   */
  private triggerInteraction(): void {
    this.input.interact = true;
    gameManager.triggerInteraction();

    // Reset interact after a short delay
    setTimeout(() => {
      this.input.interact = false;
    }, 100);
  }

  /**
   * Update player each frame
   */
  update(deltaTime: number, cameraRotation: number): void {
    // Update state machine
    this.stateMachine.update(deltaTime, this.input);

    if (!this.stateMachine.canMove()) {
      this.velocity.set(0, 0, 0);
      return;
    }

    // 1. Calculate Movement Speed & Direction
    const speed = this.stateMachine.getMovementSpeed(
      this.config.walkSpeed,
      this.config.runSpeed
    );

    const moveDirection = new Vector3();
    if (speed > 0) {
      moveDirection.copy(this.calculateMoveDirection(cameraRotation));
    }

    // 2. Predict next position (XZ Plane)
    const nextX = this.position.x + moveDirection.x * speed * deltaTime;
    const nextZ = this.position.z + moveDirection.z * speed * deltaTime;

    // Helper for multi-point ground sampling
    const getSampledHeight = (x: number, z: number) => {
      const r = 0.3; // Character radius
      const h0 = TerrainSystem.getHeightAt(x, z);
      const h1 = TerrainSystem.getHeightAt(x + r, z);
      const h2 = TerrainSystem.getHeightAt(x - r, z);
      const h3 = TerrainSystem.getHeightAt(x, z + r);
      const h4 = TerrainSystem.getHeightAt(x, z - r);
      return Math.max(h0, h1, h2, h3, h4);
    };

    // 3. Terrain Checks & Wall Collision
    // Use sampled height for collision to treat character as a volume, not a point
    const currentHeight = getSampledHeight(this.position.x, this.position.z);
    const nextHeight = getSampledHeight(nextX, nextZ);

    // Calculate slope/step relative to CURRENT FEET position
    // If floating (jumping), we only care if we hit a wall that is higher than our feet
    const heightDifference = nextHeight - this.position.y;
    const MAX_STEP_HEIGHT = 0.6; // Slightly increased for better playability with volume check

    let canMove = true;

    // Block movement if trying to walk into a wall/steep slope that is higher than step limit
    if (heightDifference > MAX_STEP_HEIGHT) {
      canMove = false;
    }

    // Apply Horizontal Movement
    if (canMove) {
      const targetX = moveDirection.x * speed;
      const targetZ = moveDirection.z * speed;

      // Smooth Acceleration/Deceleration
      // Higher accel for responsive start, lower for smooth stop? Or consistent?
      // 20 is snappy.
      const accel = (moveDirection.lengthSq() > 0) ? 20 : 10;
      const t = Math.min(1, accel * deltaTime);

      this.velocity.x += (targetX - this.velocity.x) * t;
      this.velocity.z += (targetZ - this.velocity.z) * t;

      // Face direction
      if (moveDirection.lengthSq() > 0.001) {
        const targetRotation = Math.atan2(moveDirection.x, moveDirection.z);
        // Slightly faster rotation for responsiveness
        this.rotation = this.lerpAngle(this.rotation, targetRotation, 15 * deltaTime);
      }

      // Apply velocity to position
      this.position.x += this.velocity.x * deltaTime;
      this.position.z += this.velocity.z * deltaTime;
    } else {
      this.velocity.x = 0;
      this.velocity.z = 0;
    }

    // 4. Physics (Gravity & Jump)
    // Stronger gravity for snappier jump
    const gravity = this.config.gravity || -30;
    this.velocity.y += gravity * deltaTime;

    // Jump Input
    if (this.isGrounded && this.input.jump) {
      this.velocity.y = this.config.jumpForce || 12; // Increased jump force
      this.isGrounded = false;
    }

    // Apply Vertical Velocity
    this.position.y += this.velocity.y * deltaTime;

    // 5. Ground Collision Check
    // Re-check terrain height at NEW position with sampling
    const groundHeight = getSampledHeight(this.position.x, this.position.z);

    // If feet are below ground, snap to ground
    if (this.position.y < groundHeight) {
      this.position.y = groundHeight;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else {
      // If just slightly above ground (e.g. going down slope), snap down to avoid jitter
      // But only if falling or stable, not jumping up
      if (this.velocity.y <= 0 && (this.position.y - groundHeight) < 0.6) {
        this.position.y = groundHeight;
        this.velocity.y = 0;
        this.isGrounded = true;
      } else {
        this.isGrounded = false;
      }
    }

    // Safe fall into ocean (reset if too low)
    if (this.position.y < -50) {
      this.position.set(0, 5, 10);
      this.velocity.set(0, 0, 0);
      this.isGrounded = false;
    }

    // Update GameManager with new position
    gameManager.updatePlayerPosition(this.position);
  }

  /**
   * Calculate movement direction based on input and camera
   */
  private calculateMoveDirection(cameraRotation: number): Vector3 {
    const direction = new Vector3();

    if (this.input.forward) direction.z -= 1;
    if (this.input.backward) direction.z += 1;
    if (this.input.left) direction.x -= 1;
    if (this.input.right) direction.x += 1;

    // Normalize to prevent faster diagonal movement
    if (direction.lengthSq() > 0) {
      direction.normalize();

      // Rotate by camera angle (for third-person relative movement)
      const cos = Math.cos(cameraRotation);
      const sin = Math.sin(cameraRotation);

      const x = direction.x * cos - direction.z * sin;
      const z = direction.x * sin + direction.z * cos;

      direction.x = x;
      direction.z = z;
    }

    return direction;
  }

  /**
   * Smoothly interpolate between two angles
   */
  private lerpAngle(current: number, target: number, t: number): number {
    let diff = target - current;

    // Wrap angle to -PI to PI
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;

    return current + diff * t;
  }

  // -------------------------------------------------------------------------
  // Getters
  // -------------------------------------------------------------------------

  getPosition(): Vector3 {
    return this.position.clone();
  }

  getRotation(): number {
    return this.rotation;
  }

  getVelocity(): Vector3 {
    return this.velocity.clone();
  }

  getStateMachine(): PlayerStateMachine {
    return this.stateMachine;
  }

  getInput(): PlayerInput {
    return { ...this.input };
  }

  // -------------------------------------------------------------------------
  // Setters
  // -------------------------------------------------------------------------

  setPosition(position: Vector3): void {
    this.position.copy(position);
  }

  // -------------------------------------------------------------------------
  // Cleanup
  // -------------------------------------------------------------------------

  dispose(): void {
    // Remove keyboard listeners
    this.keyListeners.forEach(({ key, handler }) => {
      window.removeEventListener(key, handler as any);
    });
    this.keyListeners = [];
  }
}

export { PlayerController };
