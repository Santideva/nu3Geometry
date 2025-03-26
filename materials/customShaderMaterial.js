import * as THREE from 'three';
import SphericalCustomGeometry from '../geometries/sphericalCustomGeometry';
import logger from '../utils/logger.js';

export default class DynamicSphericalMaterial extends THREE.ShaderMaterial {
    constructor() {
        const context = logger.createContext({
            description: 'Creating DynamicSphericalMaterial'
        });
        logger.info('Initializing DynamicSphericalMaterial', context);

        try {
            super({
                uniforms: {
                    time: { value: 0 },
                    globalOrigin: { value: new THREE.Vector3(0, 0, 0) },
                    dynamicCenter: { value: new THREE.Vector3(0, 0, 0) },
                    baseColor: { value: new THREE.Color(0x3333ff) },
                    amplitude: { value: 1.0 }
                },
                vertexShader: `
                uniform float time;
                uniform vec3 baseColor;
                uniform float amplitude;

                attribute float mass;
                attribute float charge;
                attribute float density;
                attribute vec3 orientation;

                varying vec3 vPosition;
                varying vec3 vNormal;
                varying vec3 vColor;
                varying float vIntensity;

                void main() {
                    vec3 newPosition = position;

                    // Oscillation based on mass and time
                    float massFrequency = mass * 2.0;
                    float oscillation = sin(time * massFrequency) * amplitude;

                    // Displacement along orientation
                    vec3 orientationDisplacement = orientation * oscillation;
                    newPosition += orientationDisplacement;

                    // Density-driven scaling
                    float scale = 1.0 + (density * sin(time * 0.5) * 0.2);
                    newPosition *= scale;

                    // Color generation
                    vColor = baseColor * vec3(
                        abs(sin(mass * 10.0)),
                        abs(cos(charge * 5.0)),
                        abs(sin(density * 7.0))
                    );

                    // Intensity calculation
                    vIntensity = length(newPosition - position);
                    vPosition = newPosition;
                    vNormal = normal;

                    // Standard MVP transformation
                    vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    gl_PointSize = 5.0 + (vIntensity * 10.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 globalOrigin;
                uniform vec3 dynamicCenter;

                varying vec3 vPosition;
                varying vec3 vNormal;
                varying vec3 vColor;
                varying float vIntensity;

                // Utility function: Pseudo-random generation
                float random(vec3 seed) {
                    return fract(
                        sin(dot(seed, vec3(12.9898, 78.233, 45.164))) * 43758.5453
                    );
                }

                // Calculate distance between two points
                float calculateDistance(vec3 point1, vec3 point2) {
                    return length(point1 - point2);
                }

                // Generalized force interaction calculation
                float calculateForceInteraction(
                    vec3 currentPosition, 
                    vec3 referencePoint, 
                    float referenceIntensity
                ) {
                    float distance = calculateDistance(currentPosition, referencePoint);
                    float interaction = referenceIntensity / (distance * distance + 1.0);
                    interaction *= (1.0 + 0.1 * random(currentPosition));
                    return interaction;
                }

                // Advanced color transformation based on interactions
                vec3 transformColor(
                    vec3 baseColor, 
                    float interaction, 
                    float time
                ) {
                    vec3 colorVariation = vec3(
                        sin(interaction * time),
                        cos(interaction * time * 1.3),
                        sin(interaction * time * 1.7)
                    );
                    
                    return clamp(
                        baseColor + colorVariation * 0.3, 
                        vec3(0.0), 
                        vec3(1.0)
                    );
                }

                void main() {
                    // Base interaction calculations
                    float globalInteraction = calculateForceInteraction(
                        vPosition, 
                        globalOrigin, 
                        1.0
                    );
                    
                    float dynamicInteraction = calculateForceInteraction(
                        vPosition, 
                        dynamicCenter, 
                        0.5
                    );
                    
                    // Color transformation
                    vec3 finalColor = transformColor(
                        vColor, 
                        globalInteraction + dynamicInteraction, 
                        time
                    );
                    
                    // Intensity-based transparency
                    float alpha = 0.5 + (vIntensity * 0.5);
                    
                    // Final fragment color with dynamic interaction
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            transparent: true
        });

            logger.info('DynamicSphericalMaterial shader setup completed', context);
        } catch (error) {
            logger.error('Error creating DynamicSphericalMaterial', {
                ...context,
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    update(time) {
        const context = logger.createContext({
            time,
            description: 'Updating DynamicSphericalMaterial'
        });
        
        try {
            this.uniforms.time.value = time;
            logger.debug('Material time uniform updated', context);
        } catch (error) {
            logger.error('Error updating material time', {
                ...context,
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }
}

// Usage example with logging
function createDynamicPointCloud(scene) {
    const context = logger.createContext({
        description: 'Creating Dynamic Point Cloud'
    });

    try {
        const geometry = new SphericalCustomGeometry(100, 500);
        logger.info('SphericalCustomGeometry created for point cloud', context);

        const material = new DynamicSphericalMaterial();
        logger.info('DynamicSphericalMaterial created', context);

        const points = new THREE.Points(geometry, material);
        scene.add(points);
        logger.info('Points added to scene', context);

        // Animation loop
        function animate(time) {
            try {
                material.update(time * 0.001);
                requestAnimationFrame(animate);
                
                logger.debug('Point cloud animation frame', {
                    ...context,
                    time: time * 0.001
                });
            } catch (error) {
                logger.error('Error in animation loop', {
                    ...context,
                    error: error.message,
                    stack: error.stack
                });
            }
        }
        
        animate(0);

        return points;
    } catch (error) {
        logger.error('Error creating dynamic point cloud', {
            ...context,
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
}

export { createDynamicPointCloud };