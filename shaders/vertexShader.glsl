// Generalized Vertex Shader for Dynamic Geometry Manipulation

// Uniform variables for global control
uniform float time;        // Global time for animations
uniform vec3 baseColor;    // Base color for the geometry
uniform float amplitude;   // Overall amplitude of transformations

// Standard attributes
attribute float mass;      // Mass of the vertex
attribute float charge;    // Electrical charge equivalent
attribute float density;   // Density of the vertex
attribute vec3 orientation;// Directional vector

// Varying variables to pass data to fragment shader
varying vec3 vColor;
varying float vIntensity;

// Utility function for pseudo-random generation
float random(vec3 scale, float seed) {
    return fract(
        sin(dot(gl_Position.xyz + seed, scale)) * 
        43758.5453 + seed
    );
}

// Main vertex shader logic
void main() {
    // Start with original position
    vec3 newPosition = position;

    // 1. Oscillation based on mass and time
    float massFrequency = mass * 2.0;
    float oscillation = sin(time * massFrequency) * amplitude;
    
    // 2. Displacement along orientation
    vec3 orientationDisplacement = orientation * oscillation;
    newPosition += orientationDisplacement;

    // 3. Density-driven scaling
    float scale = 1.0 + (density * sin(time * 0.5) * 0.2);
    newPosition *= scale;

    // 4. Charge-based twisting
    float twistAngle = charge * time * 0.1;
    mat3 rotationMatrix = mat3(
        cos(twistAngle), -sin(twistAngle), 0.0,
        sin(twistAngle), cos(twistAngle), 0.0,
        0.0, 0.0, 1.0
    );
    newPosition = rotationMatrix * newPosition;

    // 5. Color and intensity generation
    // Combine attributes to create dynamic coloration
    vColor = baseColor * vec3(
        abs(sin(mass * 10.0)),    // Red variation
        abs(cos(charge * 5.0)),   // Green variation
        abs(sin(density * 7.0))   // Blue variation
    );

    // Intensity based on vertex transformations
    vIntensity = length(newPosition - position);

    // Standard MVP transformation
    vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Point size variation
    gl_PointSize = 5.0 + (vIntensity * 10.0);
}