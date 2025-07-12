// Infrastructure Layer - Firestore Repository Implementation
// Base repository for Firestore database operations

import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
  Firestore,
  WhereFilterOp
} from 'firebase/firestore';

import { createLogger } from '../../utils/logger';

const logger = createLogger('FirestoreRepository');

export interface RepositoryConfig {
  collectionName: string;
  enableLogging?: boolean;
  enableCache?: boolean;
}

export interface QueryOptions {
  where?: Array<{ field: string; operator: WhereFilterOp; value: any }>;
  orderBy?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  limit?: number;
  startAfter?: QueryDocumentSnapshot;
}

export abstract class FirestoreRepository<T extends { id?: string }> {
  protected db: Firestore;
  protected collectionName: string;
  protected logger = createLogger(`FirestoreRepository:${this.constructor.name}`);
  private enableLogging: boolean;
  private enableCache: boolean;

  constructor(config: RepositoryConfig) {
    this.db = getFirestore();
    this.collectionName = config.collectionName;
    this.enableLogging = config.enableLogging ?? true;
    this.enableCache = config.enableCache ?? false;

    if (this.enableLogging) {
      this.logger.info(`Repository initialized for collection: ${this.collectionName}`);
    }
  }

  /**
   * Abstract methods to be implemented by concrete repositories
   */
  protected abstract mapToEntity(data: DocumentData): T;
  protected abstract mapFromEntity(entity: T): DocumentData;

  /**
   * Create a new document
   */
  async create(entity: Omit<T, 'id'>): Promise<T> {
    try {
      const entityData = this.mapFromEntity(entity as T);
      entityData.createdAt = Timestamp.now();
      entityData.updatedAt = Timestamp.now();

      const docRef = await addDoc(collection(this.db, this.collectionName), entityData);
      
      const createdEntity = { ...entity, id: docRef.id } as T;
      
      if (this.enableLogging) {
        this.logger.info(`Created entity with ID: ${docRef.id}`);
      }

      return createdEntity;
    } catch (error) {
      this.logger.error('Error creating entity:', error);
      throw error;
    }
  }

  /**
   * Get entity by ID
   */
  async getById(id: string): Promise<T | null> {
    try {
      const docRef = doc(this.db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        if (this.enableLogging) {
          this.logger.warn(`Entity not found with ID: ${id}`);
        }
        return null;
      }

      const entity = this.mapToEntity(docSnap.data());
      entity.id = docSnap.id;

      if (this.enableLogging) {
        this.logger.info(`Retrieved entity with ID: ${id}`);
      }

      return entity;
    } catch (error) {
      this.logger.error(`Error getting entity by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update entity
   */
  async update(id: string, updates: Partial<T>): Promise<T> {
    try {
      const updateData = this.mapFromEntity(updates as T);
      updateData.updatedAt = Timestamp.now();
      
      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      const docRef = doc(this.db, this.collectionName, id);
      await updateDoc(docRef, updateData);

      const updatedEntity = await this.getById(id);
      
      if (!updatedEntity) {
        throw new Error(`Entity not found after update: ${id}`);
      }

      if (this.enableLogging) {
        this.logger.info(`Updated entity with ID: ${id}`);
      }

      return updatedEntity;
    } catch (error) {
      this.logger.error(`Error updating entity ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete entity
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(this.db, this.collectionName, id);
      await deleteDoc(docRef);

      if (this.enableLogging) {
        this.logger.info(`Deleted entity with ID: ${id}`);
      }
    } catch (error) {
      this.logger.error(`Error deleting entity ${id}:`, error);
      throw error;
    }
  }

  /**
   * Find entities with query options
   */
  async find(options: QueryOptions = {}): Promise<T[]> {
    try {
      let q = collection(this.db, this.collectionName);

      // Apply where clauses
      if (options.where) {
        for (const whereClause of options.where) {
          q = query(q, where(whereClause.field, whereClause.operator, whereClause.value));
        }
      }

      // Apply order by clauses
      if (options.orderBy) {
        for (const orderClause of options.orderBy) {
          q = query(q, orderBy(orderClause.field, orderClause.direction));
        }
      }

      // Apply limit
      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      // Apply startAfter for pagination
      if (options.startAfter) {
        q = query(q, startAfter(options.startAfter));
      }

      const querySnapshot = await getDocs(q);
      const entities: T[] = [];

      querySnapshot.forEach((doc) => {
        const entity = this.mapToEntity(doc.data());
        entity.id = doc.id;
        entities.push(entity);
      });

      if (this.enableLogging) {
        this.logger.info(`Found ${entities.length} entities`);
      }

      return entities;
    } catch (error) {
      this.logger.error('Error finding entities:', error);
      throw error;
    }
  }

  /**
   * Get all entities
   */
  async getAll(): Promise<T[]> {
    return this.find();
  }

  /**
   * Count total entities
   */
  async count(options: Pick<QueryOptions, 'where'> = {}): Promise<number> {
    try {
      const entities = await this.find({ where: options.where });
      return entities.length;
    } catch (error) {
      this.logger.error('Error counting entities:', error);
      throw error;
    }
  }

  /**
   * Check if entity exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const entity = await this.getById(id);
      return entity !== null;
    } catch (error) {
      this.logger.error(`Error checking if entity exists ${id}:`, error);
      return false;
    }
  }

  /**
   * Find entities by field value
   */
  async findByField(field: string, value: any): Promise<T[]> {
    return this.find({
      where: [{ field, operator: '==', value }]
    });
  }

  /**
   * Get collection stats
   */
  async getStats(): Promise<{ totalCount: number; lastUpdated: Date | null }> {
    try {
      const entities = await this.getAll();
      const totalCount = entities.length;
      
      // Find last updated entity
      const sortedEntities = await this.find({
        orderBy: [{ field: 'updatedAt', direction: 'desc' }],
        limit: 1
      });

      const lastUpdated = sortedEntities.length > 0 && sortedEntities[0].updatedAt 
        ? new Date(sortedEntities[0].updatedAt.toDate())
        : null;

      return { totalCount, lastUpdated };
    } catch (error) {
      this.logger.error('Error getting repository stats:', error);
      throw error;
    }
  }
}

/**
 * Health check for Firestore connection
 */
export async function checkFirestoreHealth(): Promise<{ status: 'healthy' | 'unhealthy'; message: string }> {
  try {
    const db = getFirestore();
    // Simple read operation to test connection
    const testDoc = doc(db, 'health-check', 'test');
    await getDoc(testDoc);
    
    return { status: 'healthy', message: 'Firestore connection successful' };
  } catch (error) {
    logger.error('Firestore health check failed:', error);
    return { 
      status: 'unhealthy', 
      message: error instanceof Error ? error.message : 'Unknown Firestore error' 
    };
  }
} 