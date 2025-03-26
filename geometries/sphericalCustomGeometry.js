import * as THREE from 'three';
import logger from '../utils/logger.js';

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
            dynamicEvolution: config.dynamicEvolution || true
        };

        // Comprehensive property matrix
        this.propertyMatrix = this.initializePropertyMatrix();

        // Scalar field generation parameters
        this.scalarField = {
            time: 0
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
        const { radius } = this.config;
        
        // Base spherical coordinate with scalar field modification
        let baseSDF = radius + (
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
                dynamicTime: this.scalarField.time
            });

        } catch (error) {
            logger.error('SphericalCustomGeometry Generation Failed', {
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    // Update method for dynamic evolution
    update(deltaTime) {
        if (this.config.dynamicEvolution) {
            this.scalarField.time += deltaTime * this.config.morphSpeed;
            this.generateScalarFieldGeometry();
            
            logger.debug('Geometry Updated', {
                time: this.scalarField.time,
                morphSpeed: this.config.morphSpeed
            });
        }
    }
}