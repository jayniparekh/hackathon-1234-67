"""
Module 4: Enhancement Suggestion Engine
Aggregates all analyses and generates actionable suggestions
"""

from typing import List, Dict, Any
import json


class SuggestionEngine:
    """
    Engine for generating content enhancement suggestions
    """
    
    def __init__(self):
        """Initialize suggestion engine"""
        self.suggestion_templates = self._load_templates()
    
    def _load_templates(self) -> Dict:
        """Load suggestion templates"""
        return {
            'narrative_drift': {
                'high': "Strong narrative drift detected. Consider adding transitional sentences to connect paragraph {position} with the previous content.",
                'medium': "Moderate topic shift in paragraph {position}. A brief transition could improve flow.",
                'low': "Minor topic shift detected in paragraph {position}. Flow is acceptable but could be smoother."
            },
            'passive_voice': {
                'suggestion': "Consider converting passive voice to active voice for clarity and impact.",
                'example': "Change '{original}' to '{converted}'"
            },
            'formality': {
                'too_informal': "Text contains informal language. Consider making it more formal for professional contexts.",
                'too_formal': "Text may be overly formal. Consider using simpler language for better readability.",
                'mixed': "Inconsistent formality levels detected. Aim for consistent tone throughout."
            },
            'structure': {
                'long_sentences': "Some sentences are very long. Consider breaking them into shorter, clearer statements.",
                'short_sentences': "Many short sentences detected. Consider combining related ideas for better flow.",
                'complexity': "Sentence structure is complex. Simplify where possible for clarity."
            },
            'coherence': {
                'excellent': "Text shows excellent coherence. Paragraphs flow naturally.",
                'good': "Good overall coherence. Minor improvements possible in transitions.",
                'fair': "Moderate coherence. Several paragraphs could benefit from better connections.",
                'poor': "Weak coherence detected. Significant restructuring recommended."
            },
            'contradiction': {
                'conflicting_info': "Potential contradiction detected: {details}. Review for consistency."
            }
        }
    
    def generate_suggestions(self, analysis_results: Dict) -> List[Dict]:
        """
        Generate comprehensive suggestions from all analyses
        
        Args:
            analysis_results: Combined results from all engines
            
        Returns:
            List of actionable suggestions
        """
        suggestions = []
        
        # 1. Narrative Drift Suggestions
        if 'thematic_drift' in analysis_results:
            drift_data = analysis_results['thematic_drift']
            if drift_data.get('drift_detected'):
                for drift in drift_data.get('drift_points', []):
                    template = self.suggestion_templates['narrative_drift'][drift['severity']]
                    suggestions.append({
                        'type': 'narrative_drift',
                        'severity': drift['severity'],
                        'position': drift['position'],
                        'suggestion': template.format(position=drift['position']),
                        'score': drift['similarity_score'],
                        'details': {
                            'paragraph_before': drift['paragraph_before'][:100] + '...',
                            'paragraph_after': drift['paragraph_after'][:100] + '...'
                        }
                    })
        
        # 2. Passive Voice Suggestions
        if 'passive_voice' in analysis_results:
            passive_data = analysis_results['passive_voice']
            for passive in passive_data:
                if passive.get('conversion_made'):
                    template = self.suggestion_templates['passive_voice']['example']
                    suggestions.append({
                        'type': 'passive_voice',
                        'severity': 'medium',
                        'position': passive.get('start', 0),
                        'suggestion': template.format(
                            original=passive['original'],
                            converted=passive['converted']
                        ),
                        'details': passive
                    })
        
        # 3. Tone/Formality Suggestions
        if 'tone_analysis' in analysis_results:
            tone_data = analysis_results['tone_analysis']
            formality_score = tone_data.get('formality_score', 0.5)
            
            if formality_score < 0.3:
                suggestions.append({
                    'type': 'formality',
                    'severity': 'medium',
                    'suggestion': self.suggestion_templates['formality']['too_informal'],
                    'score': formality_score,
                    'details': tone_data
                })
            elif formality_score > 0.8:
                suggestions.append({
                    'type': 'formality',
                    'severity': 'low',
                    'suggestion': self.suggestion_templates['formality']['too_formal'],
                    'score': formality_score,
                    'details': tone_data
                })
        
        # 4. Coherence Suggestions
        if 'coherence' in analysis_results:
            coherence_data = analysis_results['coherence']
            level = coherence_data.get('coherence_level', 'fair')
            
            if level in ['fair', 'poor']:
                suggestions.append({
                    'type': 'coherence',
                    'severity': 'high' if level == 'poor' else 'medium',
                    'suggestion': self.suggestion_templates['coherence'][level],
                    'score': coherence_data.get('coherence_score', 0.5),
                    'details': coherence_data
                })
        
        # 5. Structure Suggestions
        if 'structure_analysis' in analysis_results:
            structure_data = analysis_results['structure_analysis']
            avg_length = structure_data.get('avg_sentence_length', 0)
            
            if avg_length > 30:
                suggestions.append({
                    'type': 'structure',
                    'severity': 'medium',
                    'suggestion': self.suggestion_templates['structure']['long_sentences'],
                    'score': avg_length,
                    'details': structure_data
                })
            elif avg_length < 10:
                suggestions.append({
                    'type': 'structure',
                    'severity': 'low',
                    'suggestion': self.suggestion_templates['structure']['short_sentences'],
                    'score': avg_length,
                    'details': structure_data
                })
        
        # 6. Contradiction Suggestions
        if 'contradictions' in analysis_results:
            contradictions = analysis_results['contradictions']
            for contradiction in contradictions:
                details = f"{contradiction.get('entity', 'Entity')} has conflicting {contradiction.get('predicate', 'relationship')}"
                suggestions.append({
                    'type': 'contradiction',
                    'severity': contradiction.get('severity', 'medium'),
                    'suggestion': self.suggestion_templates['contradiction']['conflicting_info'].format(
                        details=details
                    ),
                    'details': contradiction
                })
        
        # Sort by severity
        severity_order = {'high': 0, 'medium': 1, 'low': 2}
        suggestions.sort(key=lambda x: severity_order.get(x.get('severity', 'low'), 2))
        
        return suggestions
    
    def generate_summary(self, analysis_results: Dict, suggestions: List[Dict]) -> Dict:
        """
        Generate overall summary of the analysis
        
        Args:
            analysis_results: All analysis results
            suggestions: Generated suggestions
            
        Returns:
            Summary dictionary
        """
        # Count issues by severity
        severity_counts = {'high': 0, 'medium': 0, 'low': 0}
        for suggestion in suggestions:
            severity = suggestion.get('severity', 'low')
            severity_counts[severity] += 1
        
        # Calculate overall quality score (0-100)
        quality_score = 100
        quality_score -= severity_counts['high'] * 15
        quality_score -= severity_counts['medium'] * 8
        quality_score -= severity_counts['low'] * 3
        quality_score = max(0, min(100, quality_score))
        
        # Determine overall assessment
        if quality_score >= 85:
            assessment = "excellent"
        elif quality_score >= 70:
            assessment = "good"
        elif quality_score >= 50:
            assessment = "fair"
        else:
            assessment = "needs_improvement"
        
        return {
            'quality_score': quality_score,
            'assessment': assessment,
            'total_suggestions': len(suggestions),
            'severity_breakdown': severity_counts,
            'key_strengths': self._identify_strengths(analysis_results),
            'key_weaknesses': self._identify_weaknesses(suggestions),
            'priority_actions': suggestions[:3] if suggestions else []
        }
    
    def _identify_strengths(self, analysis_results: Dict) -> List[str]:
        """Identify text strengths"""
        strengths = []
        
        if 'coherence' in analysis_results:
            level = analysis_results['coherence'].get('coherence_level')
            if level in ['excellent', 'good']:
                strengths.append(f"Strong thematic coherence ({level})")
        
        if 'tone_analysis' in analysis_results:
            confidence = analysis_results['tone_analysis'].get('confidence', 0)
            if confidence > 0.8:
                strengths.append("Consistent tone throughout")
        
        if 'structure_analysis' in analysis_results:
            passive_count = analysis_results['structure_analysis'].get('passive_voice_count', 0)
            if passive_count == 0:
                strengths.append("Active voice used effectively")
        
        return strengths if strengths else ["Text structure is functional"]
    
    def _identify_weaknesses(self, suggestions: List[Dict]) -> List[str]:
        """Identify key weaknesses from suggestions"""
        weaknesses = []
        
        # Group by type
        by_type = {}
        for suggestion in suggestions:
            stype = suggestion.get('type', 'other')
            if stype not in by_type:
                by_type[stype] = []
            by_type[stype].append(suggestion)
        
        # Identify major issues
        if 'narrative_drift' in by_type and len(by_type['narrative_drift']) >= 2:
            weaknesses.append(f"Multiple narrative drift points ({len(by_type['narrative_drift'])})")
        
        if 'passive_voice' in by_type and len(by_type['passive_voice']) >= 3:
            weaknesses.append(f"Frequent passive voice usage ({len(by_type['passive_voice'])} instances)")
        
        if 'contradiction' in by_type:
            weaknesses.append(f"Potential contradictions detected ({len(by_type['contradiction'])})")
        
        return weaknesses if weaknesses else ["Minor areas for improvement"]
    
    def export_report(self, analysis_results: Dict, suggestions: List[Dict], 
                     summary: Dict, filepath: str = None) -> str:
        """
        Export complete analysis report
        
        Args:
            analysis_results: All analysis results
            suggestions: Generated suggestions
            summary: Analysis summary
            filepath: Optional file path to save
            
        Returns:
            Report as JSON string
        """
        report = {
            'summary': summary,
            'suggestions': suggestions,
            'detailed_analysis': analysis_results,
            'metadata': {
                'analysis_timestamp': self._get_timestamp(),
                'version': '1.0'
            }
        }
        
        report_json = json.dumps(report, indent=2)
        
        if filepath:
            with open(filepath, 'w') as f:
                f.write(report_json)
        
        return report_json
    
    def _get_timestamp(self) -> str:
        """Get current timestamp"""
        from datetime import datetime
        return datetime.now().isoformat()