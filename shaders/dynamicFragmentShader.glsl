// Universal Dynamic Fragment Shader
// Designed for flexible, independent use across different geometries

// Incoming variables from vertex shader
varying vec3 vPosition;     // 3D position of the vertex
varying vec3 vNormal;       // Surface normal
varying vec3 vColor;        // Base color
varying float vIntensity;   // Transformation intensity

// Global uniform parameters
uniform float time;         // Global time for animations
uniform vec3 globalOrigin;  // Reference point for calculations
uniform vec3 dynamicCenter; // Dynamic interaction center

// Force and interaction constants
const float GRAVITATIONAL_CONSTANT = 6.67430e-11;
const float ELECTROMAGNETIC_CONSTANT = 8.99e9;
const float PI = 3.14159265359;

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
    
    // Inverse square law interaction
    float interaction = referenceIntensity / (distance * distance + 1.0);
    
    // Add some randomness to make it more dynamic
    interaction *= (1.0 + 0.1 * random(currentPosition));
    
    return interaction;
}

// Advanced color transformation based on interactions
vec3 transformColor(
    vec3 baseColor, 
    float interaction, 
    float time
) {
    // Sine wave color modulation
    vec3 colorVariation = vec3(
        sin(interaction * time),
        cos(interaction * time * 1.3),
        sin(interaction * time * 1.7)
    );
    
    // Blend base color with interaction-driven variation
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