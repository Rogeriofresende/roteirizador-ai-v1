// Performance Monitoring System - ES Modules
import fs from 'fs';
import path from 'path';

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            buildTime: null,
            buildSize: null,
            bundleSize: null,
            timestamp: new Date().toISOString()
        };
    }

    getFolderSize(dirPath) {
        let totalSize = 0;
        try {
            const files = fs.readdirSync(dirPath);
            
            files.forEach(file => {
                const filePath = path.join(dirPath, file);
                const stats = fs.statSync(filePath);
                
                if (stats.isDirectory()) {
                    totalSize += this.getFolderSize(filePath);
                } else {
                    totalSize += stats.size;
                }
            });
        } catch (error) {
            // Handle permission errors gracefully
        }
        
        return totalSize;
    }

    async measureBuildSize() {
        try {
            const distPath = path.join(process.cwd(), 'dist');
            if (fs.existsSync(distPath)) {
                const sizeInMB = (this.getFolderSize(distPath) / 1024 / 1024).toFixed(2);
                this.metrics.buildSize = `${sizeInMB}MB`;
                
                // Check for main bundle
                const assetsPath = path.join(distPath, 'assets');
                if (fs.existsSync(assetsPath)) {
                    const indexFiles = fs.readdirSync(assetsPath).filter(f => f.includes('index-'));
                    if (indexFiles.length > 0) {
                        const bundleStats = fs.statSync(path.join(assetsPath, indexFiles[0]));
                        const bundleSizeKB = (bundleStats.size / 1024).toFixed(2);
                        this.metrics.bundleSize = `${bundleSizeKB}KB`;
                    }
                }
            }
        } catch (error) {
            console.log('Build size measurement failed:', error.message);
        }
    }

    async saveMetrics() {
        const metricsPath = 'performance-metrics.json';
        let existingMetrics = [];
        
        try {
            if (fs.existsSync(metricsPath)) {
                existingMetrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
            }
            
            existingMetrics.push(this.metrics);
            
            // Keep only last 10 measurements
            if (existingMetrics.length > 10) {
                existingMetrics = existingMetrics.slice(-10);
            }
            
            fs.writeFileSync(metricsPath, JSON.stringify(existingMetrics, null, 2));
            console.log('📊 Performance metrics saved to performance-metrics.json');
        } catch (error) {
            console.log('Failed to save metrics:', error.message);
        }
    }

    async run() {
        console.log('🚀 Performance Monitor Running...');
        await this.measureBuildSize();
        await this.saveMetrics();
        
        console.log('📊 Current Metrics:');
        console.log(`- Build Size: ${this.metrics.buildSize || 'N/A'}`);
        console.log(`- Bundle Size: ${this.metrics.bundleSize || 'N/A'}`);
        console.log(`- Timestamp: ${this.metrics.timestamp}`);
    }
}

// Run if called directly
const monitor = new PerformanceMonitor();
monitor.run().catch(console.error);

export default PerformanceMonitor;
