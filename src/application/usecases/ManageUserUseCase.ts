// ManageUserUseCase - Clean Architecture V6.4
// Use Case para gerenciamento de usuários e autenticação

import { 
  CreateUserDTO, 
  UpdateUserPreferencesDTO,
  UserResponseDTO, 
  ValidationResult, 
  ApiResponse 
} from '../dto';

import {
  IUserRepository,
  IAnalyticsService,
  INotificationService,
  ILogger,
  UserEntity
} from '../interfaces';

// Interface para o Use Case
export interface IManageUserUseCase {
  createUser(input: CreateUserDTO): Promise<ApiResponse<UserResponseDTO>>;
  updateUserPreferences(input: UpdateUserPreferencesDTO): Promise<ApiResponse<UserResponseDTO>>;
  getUserById(userId: string): Promise<ApiResponse<UserResponseDTO>>;
  validateUserInput(input: CreateUserDTO): ValidationResult;
}

// Implementação do Use Case
export class ManageUserUseCase implements IManageUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly analyticsService: IAnalyticsService,
    private readonly notificationService: INotificationService,
    private readonly logger: ILogger
  ) {}

  async createUser(input: CreateUserDTO): Promise<ApiResponse<UserResponseDTO>> {
    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();

    try {
      // 1. Validate input
      const validation = this.validateUserInput(input);
      if (!validation.isValid) {
        this.logger.warn('User input validation failed', { email: input.email, errors: validation.errors });
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'User input validation failed',
            details: validation.errors
          },
          metadata: { timestamp, version: '6.4', requestId }
        };
      }

      // 2. Check if user already exists
      const existingUser = await this.userRepository.findByEmail(input.email);
      if (existingUser) {
        this.logger.warn('User creation attempted for existing email', { email: input.email });
        return {
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: 'User with this email already exists',
            details: { email: input.email }
          },
          metadata: { timestamp, version: '6.4', requestId }
        };
      }

      // 3. Create user entity data
      const userData: CreateUserDTO = {
        uid: input.uid,
        email: input.email,
        displayName: input.displayName,
        photoURL: input.photoURL
      };

      // 4. Save user to repository
      const savedUser = await this.userRepository.create(userData);

      // 5. Initialize user analytics
      await this.analyticsService.initializeUserAnalytics(savedUser.id);

      // 6. Send welcome notification
      await this.notificationService.sendWelcomeEmail({
        email: input.email,
        displayName: input.displayName,
        userId: savedUser.id
      });

      // 7. Track user creation event
      await this.analyticsService.trackEvent({
        type: 'user_created',
        userId: savedUser.id,
        metadata: {
          plan: 'free',
          registrationMethod: 'firebase',
          hasPhotoURL: !!input.photoURL
        },
        timestamp: new Date()
      });

      // 8. Return response
      const response: UserResponseDTO = {
        id: savedUser.id,
        email: savedUser.email,
        displayName: savedUser.displayName,
        photoURL: savedUser.photoURL,
        isVerified: savedUser.emailVerified,
        plan: savedUser.subscription,
        createdAt: savedUser.createdAt.toISOString(),
        lastLoginAt: savedUser.lastLoginAt.toISOString()
      };

      this.logger.info('User created successfully', {
        userId: savedUser.id,
        email: savedUser.email,
        displayName: savedUser.displayName
      });

      return {
        success: true,
        data: response,
        metadata: { timestamp, version: '6.4', requestId }
      };

    } catch (error) {
      this.logger.error('ManageUserUseCase createUser failed', error as Error, {
        email: input.email,
        requestId
      });
      
      return {
        success: false,
        error: {
          code: 'USER_CREATION_ERROR',
          message: 'Failed to create user',
          details: (error as Error).message
        },
        metadata: { timestamp, version: '6.4', requestId }
      };
    }
  }

  async updateUserPreferences(input: UpdateUserPreferencesDTO): Promise<ApiResponse<UserResponseDTO>> {
    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();

    try {
      // 1. Get existing user
      const existingUser = await this.userRepository.findById(input.userId);
      if (!existingUser) {
        this.logger.warn('User preferences update attempted for non-existing user', { userId: input.userId });
        return {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
            details: { userId: input.userId }
          },
          metadata: { timestamp, version: '6.4', requestId }
        };
      }

      // 2. Update preferences
      const updatedUser = await this.userRepository.update(input.userId, input);

      // 3. Track preferences update
      await this.analyticsService.trackEvent({
        type: 'user_preferences_updated',
        userId: input.userId,
        metadata: {
          changedFields: Object.keys(input.preferences),
          aiSuggestionsEnabled: input.preferences.aiSuggestionsEnabled
        },
        timestamp: new Date()
      });

      // 4. Return response
      const response: UserResponseDTO = {
        id: updatedUser.id,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        photoURL: updatedUser.photoURL,
        isVerified: updatedUser.emailVerified,
        plan: updatedUser.subscription,
        createdAt: updatedUser.createdAt.toISOString(),
        lastLoginAt: updatedUser.lastLoginAt.toISOString()
      };

      this.logger.info('User preferences updated successfully', {
        userId: input.userId,
        changedFields: Object.keys(input.preferences)
      });

      return {
        success: true,
        data: response,
        metadata: { timestamp, version: '6.4', requestId }
      };

    } catch (error) {
      this.logger.error('ManageUserUseCase updateUserPreferences failed', error as Error, {
        userId: input.userId,
        requestId
      });
      
      return {
        success: false,
        error: {
          code: 'PREFERENCES_UPDATE_ERROR',
          message: 'Failed to update user preferences',
          details: (error as Error).message
        },
        metadata: { timestamp, version: '6.4', requestId }
      };
    }
  }

  async getUserById(userId: string): Promise<ApiResponse<UserResponseDTO>> {
    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();

    try {
      // 1. Validate userId
      if (!userId) {
        this.logger.warn('Get user attempted with empty userId');
        return {
          success: false,
          error: {
            code: 'INVALID_USER_ID',
            message: 'User ID is required',
            details: { userId }
          },
          metadata: { timestamp, version: '6.4', requestId }
        };
      }

      // 2. Get user from repository
      const user = await this.userRepository.findById(userId);
      if (!user) {
        this.logger.warn('User not found', { userId });
        return {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
            details: { userId }
          },
          metadata: { timestamp, version: '6.4', requestId }
        };
      }

      // 3. Update last access time
      await this.userRepository.updateLastAccess(userId);

      // 4. Return response
      const response: UserResponseDTO = {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        isVerified: user.emailVerified,
        plan: user.subscription,
        createdAt: user.createdAt.toISOString(),
        lastLoginAt: user.lastLoginAt.toISOString()
      };

      this.logger.debug('User fetched successfully', { userId, email: user.email });

      return {
        success: true,
        data: response,
        metadata: { timestamp, version: '6.4', requestId }
      };

    } catch (error) {
      this.logger.error('ManageUserUseCase getUserById failed', error as Error, {
        userId,
        requestId
      });
      
      return {
        success: false,
        error: {
          code: 'USER_FETCH_ERROR',
          message: 'Failed to fetch user',
          details: (error as Error).message
        },
        metadata: { timestamp, version: '6.4', requestId }
      };
    }
  }

  validateUserInput(input: CreateUserDTO): ValidationResult {
    const errors: Array<{ field: string; message: string; code: string }> = [];
    const warnings: Array<{ field: string; message: string; code: string }> = [];

    // Required fields validation
    if (!input.uid) {
      errors.push({ field: 'uid', message: 'User UID is required', code: 'REQUIRED' });
    }

    if (!input.email) {
      errors.push({ field: 'email', message: 'Email is required', code: 'REQUIRED' });
    } else if (!this.isValidEmail(input.email)) {
      errors.push({ field: 'email', message: 'Invalid email format', code: 'INVALID_FORMAT' });
    }

    if (!input.displayName) {
      errors.push({ field: 'displayName', message: 'Display name is required', code: 'REQUIRED' });
    } else if (input.displayName.length < 2) {
      errors.push({ field: 'displayName', message: 'Display name must be at least 2 characters', code: 'MIN_LENGTH' });
    } else if (input.displayName.length > 50) {
      errors.push({ field: 'displayName', message: 'Display name must be less than 50 characters', code: 'MAX_LENGTH' });
    }

    // Photo URL validation
    if (input.photoURL && !this.isValidURL(input.photoURL)) {
      warnings.push({ 
        field: 'photoURL', 
        message: 'Photo URL format may be invalid', 
        code: 'INVALID_URL' 
      });
    }

    // Display name content validation
    if (input.displayName && this.hasInappropriateContent(input.displayName)) {
      errors.push({ 
        field: 'displayName', 
        message: 'Display name contains inappropriate content', 
        code: 'INAPPROPRIATE_CONTENT' 
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private hasInappropriateContent(text: string): boolean {
    // Basic inappropriate content detection
    const inappropriateWords = ['spam', 'test123', 'admin', 'root'];
    const lowerText = text.toLowerCase();
    return inappropriateWords.some(word => lowerText.includes(word));
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 