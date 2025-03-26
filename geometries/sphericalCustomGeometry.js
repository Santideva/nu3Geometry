import * as THREE from 'three';
import logger from '../utils/logger.js'; // Assuming the logger is in a separate file

export default class SphericalCustomGeometry extends THREE.BufferGeometry {
    constructor(radius = 100, polygonCount = 100) {
        super();

        // Log geometry creation context
        const context = logger.createContext({
            radius,
            polygonCount,
            description: 'Generating SphericalCustomGeometry'
        });
        logger.info('Creating SphericalCustomGeometry', context);

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
                // Spherical coordinate generation similar to original script
                const theta = (i / polygonCount) * Math.PI * 2;
                const phi = (i / polygonCount) * Math.PI;
                const r = radius + (i * radius / polygonCount);

                // Convert spherical to Cartesian
                const x = r * Math.sin(phi) * Math.cos(theta);
                const y = r * Math.sin(phi) * Math.sin(theta);
                const z = r * Math.cos(phi);

                positions.push(x, y, z);

                // Mirroring the attribute generation from SphericalCanvas
                masses.push(10 + i % 5);
                charges.push((i % 3) - 1);
                symmetryIndices.push(i % 8);

                lightProperties.push(
                    0.3 + (i % 10) / 10,  // reflectivity
                    0.2                   // absorption
                );

                valencies.push(i % 4);
                volumes.push(10 + (i % 5) * 5);
                densities.push(0.2 + (i % 5) / 10);

                // Orientation as a vec3
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

            logger.info('SphericalCustomGeometry attributes set successfully', context);
        } catch (error) {
            logger.error('Error creating SphericalCustomGeometry', {
                ...context,
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }
}