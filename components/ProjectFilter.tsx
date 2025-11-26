import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Project } from '../hooks/useTasks';

interface ProjectFilterProps {
    projects: Project[];
    selectedProjectId: string | null;
    onSelectProject: (projectId: string | null) => void;
}

export default function ProjectFilter({ projects, selectedProjectId, onSelectProject }: ProjectFilterProps) {
    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <TouchableOpacity
                    style={[
                        styles.pill,
                        selectedProjectId === null && styles.activePill
                    ]}
                    onPress={() => onSelectProject(null)}
                >
                    <Text style={[
                        styles.pillText,
                        selectedProjectId === null && styles.activePillText
                    ]}>
                        All
                    </Text>
                </TouchableOpacity>

                {projects.map((project) => (
                    <TouchableOpacity
                        key={project.id}
                        style={[
                            styles.pill,
                            selectedProjectId === project.id && styles.activePill,
                            selectedProjectId === project.id && { backgroundColor: project.color + '20' } // 20% opacity
                        ]}
                        onPress={() => onSelectProject(project.id)}
                    >
                        <Text style={[
                            styles.pillText,
                            selectedProjectId === project.id && { color: project.color, fontWeight: '700' }
                        ]}>
                            {project.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    scrollContent: {
        paddingHorizontal: 20,
        gap: 8,
    },
    pill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#eee',
    },
    activePill: {
        backgroundColor: '#333',
        borderColor: '#333',
    },
    pillText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    activePillText: {
        color: '#fff',
    },
});
