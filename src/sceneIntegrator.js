import * as THREE from 'three';
import SphericalCustomGeometry from '../geometries/sphericalCustomGeometry';
import DynamicSphericalMaterial from '../materials/customShaderMaterial';
import Logger from '../utils/logger';

class SphericalVisualizer {
    constructor(config = {}) {
        // Logging initialization
        this.logger = Logger;
        this.logger.info('SphericalVisualizer Constructor Invoked', 
            this.logger.createContext({ 
                config: config,
                timestamp: new Date().toISOString()
            })
        );

        // State management
        this.state = {
            // Configurable parameters
            radius: config.radius || 100,
            polygonCount: config.polygonCount || 500,
            
            // Simulation parameters
            time: 0,
            paused: false,
            
            // Visualization modes
            renderMode: 'points', // Could switch between points, wireframe, etc.
            
            // Performance and debug info
            fps: 0,
            renderCount: 0
        };

        this.logger.debug('Initial State Configuration', 
            this.logger.createContext({
                radius: this.state.radius,
                polygonCount: this.state.polygonCount,
                renderMode: this.state.renderMode
            })
        );

        // Scene setup
        try {
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.renderer = new THREE.WebGLRenderer({ antialias: true });

            this.logger.info('Three.js Components Initialized', 
                this.logger.createContext({
                    rendererType: 'WebGLRenderer',
                    antialias: true,
                    screenDimensions: {
                        width: window.innerWidth,
                        height: window.innerHeight
                    }
                })
            );
        } catch (error) {
            this.logger.error('Three.js Components Initialization Failed', 
                this.logger.createContext({ 
                    error: error.message,
                    errorStack: error.stack,
                    timestamp: new Date().toISOString()
                })
            );
            throw error;
        }

        // Orchestration components
        this.geometry = null;
        this.material = null;
        this.points = null;

        this.logger.debug('Preparing to Initialize Visualization', 
            this.logger.createContext({
                method: 'constructor',
                stage: 'pre-initialization'
            })
        );

        this.initializeVisualization();
    }

    initializeVisualization() {
        this.logger.info('Initializing Visualization Components', 
            this.logger.createContext({
                method: 'initializeVisualization',
                stage: 'start'
            })
        );

        try {
            // Create and configure geometry
            this.geometry = new SphericalCustomGeometry(
                this.state.radius, 
                this.state.polygonCount
            );

            this.logger.debug('Geometry Created', 
                this.logger.createContext({
                    radius: this.state.radius,
                    polygonCount: this.state.polygonCount,
                    vertexCount: this.geometry.attributes.position.count
                })
            );

            // Create and configure material
            this.material = new DynamicSphericalMaterial();

            this.logger.debug('Material Created', 
                this.logger.createContext({
                    materialType: 'DynamicSphericalMaterial'
                })
            );

            // Create visualization object
            this.points = new THREE.Points(this.geometry, this.material);
            this.scene.add(this.points);

            this.logger.debug('Points Object Added to Scene', 
                this.logger.createContext({
                    pointsObjectCreated: true,
                    sceneObjectCount: this.scene.children.length
                })
            );

            // Position camera
            this.camera.position.z = this.state.radius * 2;

            this.logger.info('Visualization Components Initialized Successfully', 
                this.logger.createContext({
                    geometryVertexCount: this.geometry.attributes.position.count,
                    renderMode: this.state.renderMode,
                    cameraDistance: this.camera.position.z
                })
            );
        } catch (error) {
            this.logger.error('Visualization Components Initialization Failed', 
                this.logger.createContext({ 
                    error: error.message,
                    errorStack: error.stack,
                    radius: this.state.radius,
                    polygonCount: this.state.polygonCount,
                    timestamp: new Date().toISOString()
                })
            );
            throw error;
        }
    }

    updateSimulationParameters(newParams) {
        this.logger.info('Updating Simulation Parameters', 
            this.logger.createContext({ 
                newParameters: newParams,
                timestamp: new Date().toISOString()
            })
        );

        // Safely update state and reconfigure visualization
        this.state = { ...this.state, ...newParams };
        
        if (newParams.radius || newParams.polygonCount) {
            try {
                this.logger.debug('Reconfiguring Visualization', 
                    this.logger.createContext({
                        method: 'updateSimulationParameters',
                        updatedParams: {
                            radius: newParams.radius,
                            polygonCount: newParams.polygonCount
                        }
                    })
                );

                this.scene.remove(this.points);
                this.initializeVisualization();

                this.logger.info('Visualization Reconfigured Successfully', 
                    this.logger.createContext({
                        method: 'updateSimulationParameters',
                        status: 'complete'
                    })
                );
            } catch (error) {
                this.logger.error('Simulation Parameters Update Failed', 
                    this.logger.createContext({ 
                        error: error.message,
                        errorStack: error.stack,
                        parameters: newParams,
                        timestamp: new Date().toISOString()
                    })
                );
            }
        }
    }

    simulatePhysics(deltaTime) {
        try {
            const attributes = this.geometry.attributes;
            
            for (let i = 0; i < this.state.polygonCount; i++) {
                const mass = attributes.mass.array[i];
                const charge = attributes.charge.array[i];
                
                attributes.position.array[i * 3] += 
                    Math.sin(deltaTime) * mass * charge * 0.01;
                
                attributes.position.needsUpdate = true;
            }

            // Periodic performance logging
            if (this.state.renderCount % 60 === 0) {
                this.logger.debug('Physics Simulation Update', 
                    this.logger.createContext({
                        deltaTime,
                        renderCount: this.state.renderCount,
                        paused: this.state.paused,
                        polygonSimulated: this.state.polygonCount,
                        timestamp: new Date().toISOString()
                    })
                );
            }
        } catch (error) {
            this.logger.error('Physics Simulation Failed', 
                this.logger.createContext({ 
                    error: error.message,
                    errorStack: error.stack,
                    polygonCount: this.state.polygonCount,
                    timestamp: new Date().toISOString()
                })
            );
        }
    }

    animate() {
        if (this.state.paused) {
            this.logger.debug('Animation Paused', 
                this.logger.createContext({
                    pauseState: this.state.paused,
                    timestamp: new Date().toISOString()
                })
            );
            return;
        }

        try {
            // Time management
            const currentTime = performance.now() * 0.001;
            const deltaTime = currentTime - this.state.time;
            this.state.time = currentTime;

            this.logger.trace('Animation Cycle Started', 
                this.logger.createContext({
                    currentTime,
                    deltaTime,
                    renderCount: this.state.renderCount
                })
            );

            // Simulation and rendering
            this.simulatePhysics(deltaTime);
            this.material.update(currentTime);
            
            // Render
            this.renderer.render(this.scene, this.camera);
            
            // Performance tracking
            this.state.renderCount++;

            // Continue animation loop
            requestAnimationFrame(() => this.animate());
        } catch (error) {
            this.logger.error('Animation Loop Failed', 
                this.logger.createContext({ 
                    error: error.message,
                    errorStack: error.stack,
                    renderCount: this.state.renderCount,
                    timestamp: new Date().toISOString()
                })
            );
        }
    }

    start() {
        try {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(this.renderer.domElement);

            this.logger.info('Visualization Started', 
                this.logger.createContext({
                    method: 'start',
                    rendererSize: {
                        width: window.innerWidth,
                        height: window.innerHeight
                    },
                    timestamp: new Date().toISOString()
                })
            );

            this.animate();
        } catch (error) {
            this.logger.error('Visualization Start Failed', 
                this.logger.createContext({ 
                    error: error.message,
                    errorStack: error.stack,
                    timestamp: new Date().toISOString()
                })
            );
            throw error;
        }
    }

    // Debug and interaction methods
    getState() {
        this.logger.debug('State Retrieved', 
            this.logger.createContext({
                method: 'getState',
                state: { ...this.state },
                timestamp: new Date().toISOString()
            })
        );
        return { ...this.state };
    }

    togglePause() {
        this.state.paused = !this.state.paused;
        
        this.logger.info('Pause State Changed', 
            this.logger.createContext({
                method: 'togglePause',
                newPauseState: this.state.paused,
                timestamp: new Date().toISOString()
            })
        );

        if (!this.state.paused) {
            this.animate();
        }
    }
}

export default SphericalVisualizer;     