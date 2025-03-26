import SphericalVisualizer from './sceneIntegrator.js';
import Logger from '../utils/logger.js';

// Configure global logging if needed
Logger.setLogLevel('debug'); // Adjust log level as needed

// Configuration for the visualizer
const visualizerConfig = {
    radius: 100,
    polygonCount: 1000,
    // Add any other configuration parameters
};

// Main application initialization function
function initializeApplication() {
    try {
        // Log application start
        Logger.info('Application Initialization Started', 
            Logger.createContext({
                timestamp: new Date().toISOString(),
                config: visualizerConfig
            })
        );

        // Create visualizer instance
        const visualizer = new SphericalVisualizer(visualizerConfig);

        // Start the visualization
        visualizer.start();

        // Optional: Handle window resize
        window.addEventListener('resize', () => {
            Logger.debug('Window Resize Detected', 
                Logger.createContext({
                    newWidth: window.innerWidth,
                    newHeight: window.innerHeight
                })
            );

            visualizer.renderer.setSize(window.innerWidth, window.innerHeight);
            visualizer.camera.aspect = window.innerWidth / window.innerHeight;
            visualizer.camera.updateProjectionMatrix();
        });

        // Optional: Add interaction methods
        window.toggleVisualization = () => {
            visualizer.togglePause();
        };

        Logger.info('Application Initialization Complete', 
            Logger.createContext({
                timestamp: new Date().toISOString(),
                status: 'success'
            })
        );
    } catch (error) {
        Logger.error('Application Initialization Failed', 
            Logger.createContext({
                error: error.message,
                errorStack: error.stack,
                timestamp: new Date().toISOString()
            })
        );
        console.error('Failed to initialize application:', error);
    }
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApplication);

// Export for potential module usage
export { initializeApplication };