"""
Main Orchestration Pipeline
Coordinates all engines and processes text through the complete pipeline
"""

from typing import Dict, Any
import json
from backend.narrative_engine import NarrativeEngine, StructuralEngine
from backend.thematic_engine import ThematicEngine
from backend.style_engine import ToneClassifier, StyleTransformer
from backend.suggestion_engine import SuggestionEngine
from utils.text_utils import generate_text_diff, merge_consecutive_changes
import time


class AIWriterPipeline:
    """
    Main pipeline orchestrating all text enhancement modules
    """
    
    def __init__(self, config: Dict = None):
        """
        Initialize pipeline with all engines
        
        Args:
            config: Configuration dictionary
        """
        self.config = config or {}
        
        # Initialize all engines
        print("🔧 Initializing AI Writer Pipeline...")
        self.narrative_engine = NarrativeEngine()
        self.structural_engine = StructuralEngine()
        self.thematic_engine = ThematicEngine()
        self.tone_classifier = ToneClassifier()
        self.style_transformer = StyleTransformer()
        self.suggestion_engine = SuggestionEngine()
        print("✅ All engines initialized")
    
    def process_text(self, text: str, options: Dict = None) -> Dict:
        """
        Process text through complete pipeline
        
        Args:
            text: Input text to analyze and enhance
            options: Processing options
                - analyze_narrative: bool
                - analyze_structure: bool
                - analyze_theme: bool
                - analyze_tone: bool
                - suggest_enhancements: bool
                - transform_style: bool
                - target_tone: str (formal/informal)
            
        Returns:
            Complete analysis and enhancement results
        """
        options = options or {}
        start_time = time.time()
        
        print(f"\n📝 Processing text ({len(text)} characters)...")
        
        results = {
            'input_text': text,
            'text_length': len(text),
            'processing_options': options
        }
        
        # 1. NARRATIVE ANALYSIS
        if options.get('analyze_narrative', True):
            print("🔍 Analyzing narrative consistency...")
            try:
                knowledge_graph = self.narrative_engine.extract_knowledge_graph(text)
                contradictions = self.narrative_engine.detect_contradictions()
                
                results['narrative_analysis'] = {
                    'knowledge_graph': knowledge_graph,
                    'contradictions': contradictions
                }
                print(f"  ✓ Found {knowledge_graph['graph_stats']['num_entities']} entities")
                print(f"  ✓ Detected {len(contradictions)} potential contradictions")
            except Exception as e:
                print(f"  ✗ Error in narrative analysis: {e}")
                results['narrative_analysis'] = {'error': str(e)}
        
        # 2. STRUCTURAL ANALYSIS
        if options.get('analyze_structure', True):
            print("🏗️  Analyzing structure...")
            try:
                passive_voice = self.structural_engine.detect_passive_voice(text)
                structure_analysis = self.structural_engine.analyze_sentence_structure(text)
                
                # Convert passive to active
                passive_conversions = []
                for passive in passive_voice[:5]:  # Limit to first 5
                    conversion = self.structural_engine.convert_passive_to_active(
                        passive['sentence']
                    )
                    passive_conversions.append(conversion)
                
                results['structure_analysis'] = structure_analysis
                results['passive_voice'] = passive_conversions
                print(f"  ✓ Analyzed {structure_analysis['num_sentences']} sentences")
                print(f"  ✓ Found {len(passive_voice)} passive voice instances")
            except Exception as e:
                print(f"  ✗ Error in structural analysis: {e}")
                results['structure_analysis'] = {'error': str(e)}
        
        # 3. THEMATIC COHERENCE ANALYSIS
        if options.get('analyze_theme', True):
            print("🎯 Analyzing thematic coherence...")
            try:
                thematic_drift = self.thematic_engine.calculate_thematic_drift(text)
                coherence = self.thematic_engine.analyze_coherence(text)
                
                results['thematic_drift'] = thematic_drift
                results['coherence'] = coherence
                print(f"  ✓ Coherence score: {coherence['coherence_score']:.2f}")
                if thematic_drift['drift_detected']:
                    print(f"  ⚠ Detected {len(thematic_drift['drift_points'])} drift points")
            except Exception as e:
                print(f"  ✗ Error in thematic analysis: {e}")
                results['thematic_drift'] = {'error': str(e)}
        
        # 4. TONE ANALYSIS
        if options.get('analyze_tone', True):
            print("🎨 Analyzing tone and style...")
            try:
                tone_analysis = self.tone_classifier.classify_tone(text)
                feature_importance = self.tone_classifier.get_feature_importance(text)
                
                results['tone_analysis'] = tone_analysis
                results['tone_features'] = feature_importance
                print(f"  ✓ Tone: {tone_analysis['tone']} (confidence: {tone_analysis['confidence']:.2f})")
            except Exception as e:
                print(f"  ✗ Error in tone analysis: {e}")
                results['tone_analysis'] = {'error': str(e)}
        
        # 5. STYLE TRANSFORMATION (if requested)
        if options.get('transform_style', False):
            target_tone = options.get('target_tone', 'formal')
            print(f"✨ Transforming to {target_tone} style...")
            try:
                transformation = self.style_transformer.transform_formality(
                    text,
                    target_tone=target_tone
                )
                results['style_transformation'] = transformation
                print(f"  ✓ Made {transformation['num_changes']} changes")
            except Exception as e:
                print(f"  ✗ Error in style transformation: {e}")
                results['style_transformation'] = {'error': str(e)}
        
        # 6. GENERATE SUGGESTIONS
        if options.get('suggest_enhancements', True):
            print("💡 Generating enhancement suggestions...")
            try:
                suggestions = self.suggestion_engine.generate_suggestions(results)
                summary = self.suggestion_engine.generate_summary(results, suggestions)
                
                results['suggestions'] = suggestions
                results['summary'] = summary
                print(f"  ✓ Generated {len(suggestions)} suggestions")
                print(f"  ✓ Quality score: {summary['quality_score']}/100")
            except Exception as e:
                print(f"  ✗ Error generating suggestions: {e}")
                results['suggestions'] = {'error': str(e)}
        
        # 7. GENERATE DIFF (if transformation was done)
        if 'style_transformation' in results and 'error' not in results['style_transformation']:
            print("📊 Generating diff...")
            try:
                diff = generate_text_diff(
                    text,
                    results['style_transformation']['transformed_text']
                )
                results['diff'] = merge_consecutive_changes(diff)
                print(f"  ✓ Generated diff with {len(results['diff'])} changes")
            except Exception as e:
                print(f"  ✗ Error generating diff: {e}")
        
        # Calculate processing time
        processing_time = time.time() - start_time
        results['processing_time'] = processing_time
        
        print(f"\n✅ Processing complete in {processing_time:.2f} seconds")
        
        return results
    
    def export_knowledge_graph(self, filepath: str) -> Dict:
        """
        Export knowledge graph to file
        
        Args:
            filepath: Output file path
            
        Returns:
            Graph data
        """
        return self.narrative_engine.export_graph(filepath)
    
    def quick_analysis(self, text: str) -> str:
        """
        Quick analysis returning simple summary
        
        Args:
            text: Input text
            
        Returns:
            Summary string
        """
        results = self.process_text(text, {
            'analyze_narrative': True,
            'analyze_structure': True,
            'analyze_theme': True,
            'analyze_tone': True,
            'suggest_enhancements': True,
            'transform_style': False
        })
        
        summary = results.get('summary', {})
        suggestions = results.get('suggestions', [])
        
        output = f"""
=== AI WRITER ANALYSIS ===

Quality Score: {summary.get('quality_score', 0)}/100
Assessment: {summary.get('assessment', 'N/A').upper()}

Strengths:
{chr(10).join('  • ' + s for s in summary.get('key_strengths', []))}

Areas for Improvement:
{chr(10).join('  • ' + w for w in summary.get('key_weaknesses', []))}

Top Suggestions:
{chr(10).join(f"  {i+1}. [{s.get('severity', 'low').upper()}] {s.get('suggestion', '')}" for i, s in enumerate(suggestions[:5]))}
"""
        return output


def test_pipeline():
    """Test the pipeline with sample text"""
    sample_text = """
    Yeah, so basically this project is gonna be super cool. We're gonna use AI and stuff to make writing better. 
    The system was designed by the team. A lot of features were implemented. It's kinda like having a writing assistant.
    
    John went to Paris in 2020. He loved the city. Later, John mentioned he had never been to Europe before.
    The algorithm basically works by analyzing text. It's pretty awesome. Machine learning is used to detect patterns.
    """
    
    pipeline = AIWriterPipeline()
    
    print("\n" + "="*60)
    print("TESTING AI WRITER PIPELINE")
    print("="*60)
    
    results = pipeline.process_text(sample_text, {
        'analyze_narrative': True,
        'analyze_structure': True,
        'analyze_theme': True,
        'analyze_tone': True,
        'suggest_enhancements': True,
        'transform_style': True,
        'target_tone': 'formal'
    })
    
    # Print quick summary
    print("\n" + pipeline.quick_analysis(sample_text))
    
    # Save full results
    with open('test_results.json', 'w') as f:
        json.dumps(results, f, indent=2, default=str)
    
    print("\n✅ Full results saved to test_results.json")


if __name__ == "__main__":
    test_pipeline()