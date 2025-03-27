import * as THREE from 'three';
import Logger from '../utils/logger';

export class SceneCameraManager {
    constructor(config = {}) {
        // Logging initialization
        this.logger = Logger;
        
        // Default configuration with flexible options
        this.config = {
            fov: config.fov || 75,
            near: config.near || 0.1,
            far: config.far || 1000,
            cameraType: config.cameraType || 'perspective',
            dynamicPerspective: config.dynamicPerspective || false,
            initialPosition: config.initialPosition || { x: 0, y: 0, z: 200 },
            lookAt: config.lookAt || { x: 0, y: 0, z: 0 }
        };

        // Camera and controls
        this.camera = null;
        this.controls = null;
        this.activeLight = null;

        this.logger.info('SceneCameraManager Initialized', 
            this.logger.createContext({
                cameraType: this.config.cameraType,
                dynamicPerspective: this.config.dynamicPerspective,
                timestamp: new Date().toISOString()
            })
        );
    }

    // Initialize camera based on configuration
    initializeCamera(renderer) {
        try {
            const { width, height } = renderer.getSize(new THREE.Vector2());
            
            switch (this.config.cameraType) {
                case 'perspective':
                    this.camera = new THREE.PerspectiveCamera(
                        this.config.fov, 
                        width / height, 
                        this.config.near, 
                        this.config.far
                    );
                    break;
                case 'orthographic':
                    this.camera = new THREE.OrthographicCamera(
                        width / -2, 
                        width / 2, 
                        height / 2, 
                        height / -2, 
                        this.config.near, 
                        this.config.far
                    );
                    break;
                default:
                    throw new Error('Unsupported camera type');
            }

            // Set initial camera position
            this.camera.position.set(
                this.config.initialPosition.x,
                this.config.initialPosition.y,
                this.config.initialPosition.z
            );

            // Set look-at point
            this.camera.lookAt(
                this.config.lookAt.x,
                this.config.lookAt.y,
                this.config.lookAt.z
            );

            this.logger.info('Camera Initialized', 
                this.logger.createContext({
                    cameraType: this.config.cameraType,
                    position: this.camera.position,
                    lookAt: this.config.lookAt
                })
            );

            return this.camera;
        } catch (error) {
            this.logger.error('Camera Initialization Failed', 
                this.logger.createContext({ 
                    error: error.message,
                    errorStack: error.stack,
                    timestamp: new Date().toISOString()
                })
            );
            throw error;
        }
    }

    // Initialize scene lighting
    initializeLighting(scene) {
        try {
            // Ambient light for overall scene illumination
            const ambientLight = new THREE.AmbientLight(0x404040, 1);
            scene.add(ambientLight);

            // Directional light for more dynamic lighting
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(5, 5, 5);
            scene.add(directionalLight);

            // Point light for additional depth
            const pointLight = new THREE.PointLight(0xffffff, 1, 500);
            pointLight.position.set(10, 10, 10);
            scene.add(pointLight);

            // Optional: Hemisphere light for more complex lighting
            const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5);
            scene.add(hemisphereLight);

            this.activeLight = {
                ambient: ambientLight,
                directional: directionalLight,
                point: pointLight,
                hemisphere: hemisphereLight
            };

            this.logger.info('Scene Lighting Initialized', 
                this.logger.createContext({
                    ambientIntensity: ambientLight.intensity,
                    directionalIntensity: directionalLight.intensity,
                    pointLightIntensity: pointLight.intensity,
                    hemisphereLightIntensity: hemisphereLight.intensity
                })
            );

            return this.activeLight;
        } catch (error) {
            this.logger.error('Lighting Initialization Failed', 
                this.logger.createContext({ 
                    error: error.message,
                    errorStack: error.stack,
                    timestamp: new Date().toISOString()
                })
            );
            throw error;
        }
    }

    // Update camera perspective dynamically
    updatePerspective(radius, polygonCount) {
        if (this.config.dynamicPerspective && this.camera) {
            // Adjust camera distance based on geometry complexity
            const scaleFactor = Math.log(polygonCount) * 1.5;
            const newZDistance = radius * scaleFactor;
            
            this.camera.position.z = newZDistance;
            
            this.logger.debug('Camera Perspective Updated', 
                this.logger.createContext({
                    radius,
                    polygonCount,
                    newZDistance,
                    timestamp: new Date().toISOString()
                })
            );
        }
    }

    // Adjust lighting dynamically
    updateLighting(shapeType) {
        if (this.activeLight) {
            // Modify light intensity and color based on shape
            const lightModifiers = {
                Sphere: { intensity: 1, color: 0xffffff },
                Cube: { intensity: 0.8, color: 0xf0f0f0 },
                Cone: { intensity: 0.9, color: 0xe0e0e0 },
                Cylinder: { intensity: 0.7, color: 0xd0d0d0 },
                Torus: { intensity: 0.6, color: 0xc0c0c0 }
            };

            const modifier = lightModifiers[shapeType] || lightModifiers.Sphere;
            
            this.activeLight.directional.intensity = modifier.intensity;
            this.activeLight.directional.color.setHex(modifier.color);

            this.logger.debug('Lighting Dynamically Updated', 
                this.logger.createContext({
                    shapeType,
                    newIntensity: modifier.intensity,
                    newColor: modifier.color
                })
            );
        }
    }

    // Dispose of resources
    dispose() {
        if (this.activeLight) {
            Object.values(this.activeLight).forEach(light => {
                light.dispose();
            });
        }
        
        this.logger.info('SceneCameraManager Resources Disposed', 
            this.logger.createContext({
                timestamp: new Date().toISOString()
            })
        );
    }
}

export default SceneCameraManager;