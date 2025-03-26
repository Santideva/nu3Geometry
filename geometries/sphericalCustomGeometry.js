import * as THREE from 'three';
import logger from '../utils/logger.js';
import { ShapeMorphEngine } from './shapeMorphEngine.js';

export default class SphericalCustomGeometry extends THREE.BufferGeometry {
    constructor(radius = 100, polygonCount = 500, config = {}) {
        super();

        // Configuration with comprehensive property space
        this.config = {
            radius,
            polygonCount,
            gridWidth: config.gridWidth || 200,
            gridHeight: config.gridHeight || 200,
            morphSpeed: config.morphSpeed || 0.5,
            dynamicEvolution: config.dynamicEvolution || true,
            
            // Shape morphing parameters
            currentShape: config.currentShape || 'Sphere',
            shapeInterpolation: null
        };

        // Initialize shape morph engine
        this.morphEngine = new ShapeMorphEngine(radius);

        // Comprehensive property matrix
        this.propertyMatrix = this.initializePropertyMatrix();

        // Scalar field generation parameters
        this.scalarField = {
            time: 0,
            shapeTransition: {
                from: null,
                to: null,
                progress: 0
            }
        };

        // Generate initial geometry
        this.generateScalarFieldGeometry();
    }

    // Initialize comprehensive property matrix
    initializePropertyMatrix() {
        const { gridWidth, gridHeight } = this.config;
        return Array.from({ length: gridWidth }, () => 
            Array.from({ length: gridHeight }, () => this.generatePropertyCell())
        );
    }

    // Generate a comprehensive property cell
    generatePropertyCell() {
        return {
            // Geometric Properties
            anisotropy: Math.random(),
            sphericity: 1.0,
            rugosity: Math.random(),
            gaussianCurvature: 0,
            meanCurvature: 0,
            torsion: 0,
            convexity: 1,
            smoothness: 1,
            edgeSharpness: 0.5,
            fractalDimension: 1,
            surfaceGradient: 0,
            normalVariation: 0,

            // Symmetry Properties
            axisSymmetry: 1,
            rotationSymmetry: 1,
            translationSymmetry: 1,
            mirrorSymmetry: 1,
            radialSymmetry: 1,

            // Topological & Structural Properties
            eulerCharacteristic: 0,
            localConnectivity: 1,
            boundaryCurvature: 0,
            tangentPlaneVariance: 0,
            densityGradient: 1,
            rigidity: 1
        };
    }

    // Combined Signed Distance Function (SDF)
    combinedSDF(theta, phi, props, time) {
        const { radius, currentShape, shapeInterpolation } = this.config;
        
        // Get current shape's SDF function
        const currentShapeSDF = ShapeMorphEngine.shapeSDFs[currentShape];
        
        // Base shape transformation
        let baseSDF = currentShapeSDF(theta, phi, radius);
        
        // Apply shape interpolation if in progress
        if (shapeInterpolation) {
            const fromSDF = ShapeMorphEngine.shapeSDFs[shapeInterpolation.from];
            const toSDF = ShapeMorphEngine.shapeSDFs[shapeInterpolation.to];
            
            // Interpolate between shapes
            const fromValue = fromSDF(theta, phi, radius);
            const toValue = toSDF(theta, phi, radius);
            
            baseSDF = THREE.MathUtils.lerp(
                fromValue, 
                toValue, 
                this.scalarField.shapeTransition.progress
            );
        }
        
        // Additional scalar field modification
        baseSDF += (
            Math.sin(theta * props.rugosity + time) * props.anisotropy * 10 +
            Math.cos(phi * props.sphericity + time) * props.convexity * 5
        );
        
        return baseSDF;
    }

    // Generate geometry with scalar field influences
    generateScalarFieldGeometry() {
        const { radius, polygonCount } = this.config;
        const positions = [];
        const masses = [];
        const charges = [];
        const symmetryIndices = [];
        const lightProperties = [];
        const valencies = [];
        const volumes = [];
        const densities = [];
        const orientations = [];

        try {
            for (let i = 0; i < polygonCount; i++) {
                // Spherical coordinate generation
                const theta = (i / polygonCount) * Math.PI * 2;
                const phi = (i / polygonCount) * Math.PI;

                // Select property based on current coordinate
                const gridX = Math.floor((theta / (Math.PI * 2)) * this.config.gridWidth);
                const gridY = Math.floor((phi / Math.PI) * this.config.gridHeight);
                const props = this.propertyMatrix[
                    Math.min(gridX, this.config.gridWidth - 1)
                ][
                    Math.min(gridY, this.config.gridHeight - 1)
                ];

                // Compute dynamic radius with scalar field influence
                const dynamicRadius = this.combinedSDF(theta, phi, props, this.scalarField.time);

                // Convert to Cartesian coordinates
                const x = dynamicRadius * Math.sin(phi) * Math.cos(theta);
                const y = dynamicRadius * Math.sin(phi) * Math.sin(theta);
                const z = dynamicRadius * Math.cos(phi);

                positions.push(x, y, z);

                // Attribute generation with property-based variations
                masses.push(10 + props.sphericity * 5);
                charges.push((props.rugosity - 0.5) * 2);
                symmetryIndices.push(Math.floor(props.axisSymmetry * 8));
                
                lightProperties.push(
                    0.3 + props.smoothness * 0.5,  // reflectivity
                    0.2 + props.edgeSharpness * 0.3  // absorption
                );
                
                valencies.push(Math.floor(props.localConnectivity * 4));
                volumes.push(10 + props.densityGradient * 10);
                densities.push(0.2 + props.rigidity * 0.3);
                orientations.push(0, 1, 0);
            }

            // Set attributes
            this.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            this.setAttribute('mass', new THREE.Float32BufferAttribute(masses, 1));
            this.setAttribute('charge', new THREE.Float32BufferAttribute(charges, 1));
            this.setAttribute('symmetryIndex', new THREE.Float32BufferAttribute(symmetryIndices, 1));
            this.setAttribute('lightProperties', new THREE.Float32BufferAttribute(lightProperties, 2));
            this.setAttribute('valency', new THREE.Float32BufferAttribute(valencies, 1));
            this.setAttribute('volume', new THREE.Float32BufferAttribute(volumes, 1));
            this.setAttribute('density', new THREE.Float32BufferAttribute(densities, 1));
            this.setAttribute('orientation', new THREE.Float32BufferAttribute(orientations, 3));

            logger.info('SphericalCustomGeometry Generated', {
                radius,
                polygonCount,
                dynamicTime: this.scalarField.time,
                currentShape: this.config.currentShape
            });

        } catch (error) {
            logger.error('SphericalCustomGeometry Generation Failed', {
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    // Method to morph between shapes
    morphToShape(targetShape, duration = 1.0) {
        const { currentShape } = this.config;
        
        // Validate shape exists
        if (!ShapeMorphEngine.shapeSDFs[targetShape]) {
            logger.error('Invalid Shape Morphing Target', {
                requestedShape: targetShape,
                availableShapes: Object.keys(ShapeMorphEngine.shapeSDFs)
            });
            return;
        }
        
        // Start shape interpolation
        this.config.shapeInterpolation = {
            from: currentShape,
            to: targetShape,
            duration
        };
        
        // Reset transition progress
        this.scalarField.shapeTransition = {
            from: currentShape,
            to: targetShape,
            progress: 0
        };
        
        // Update current shape
        this.config.currentShape = targetShape;
        
        logger.info('Shape Morphing Initiated', {
            fromShape: currentShape,
            toShape: targetShape,
            duration
        });
    }

    // Update method for dynamic evolution
    update(deltaTime) {
        if (this.config.dynamicEvolution) {
            this.scalarField.time += deltaTime * this.config.morphSpeed;
            
            // Handle shape interpolation
            if (this.config.shapeInterpolation) {
                const { progress, from, to } = this.scalarField.shapeTransition;
                const { duration } = this.config.shapeInterpolation;
                
                // Increment progress
                this.scalarField.shapeTransition.progress = 
                    Math.min(progress + deltaTime / duration, 1);
                
                // Complete interpolation
                if (this.scalarField.shapeTransition.progress >= 1) {
                    this.config.shapeInterpolation = null;
                    logger.info('Shape Morphing Complete', { 
                        fromShape: from, 
                        toShape: to 
                    });
                }
            }
            
            // Regenerate geometry
            this.generateScalarFieldGeometry();
            
            logger.debug('Geometry Updated', {
                time: this.scalarField.time,
                morphSpeed: this.config.morphSpeed,
                currentShape: this.config.currentShape
            });
        }
    }
}