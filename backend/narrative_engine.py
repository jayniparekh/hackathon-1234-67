"""
Module 1: Narrative & Structural Engine
Handles knowledge graph extraction, thematic drift detection, and passive voice conversion
"""

import spacy
import networkx as nx
from typing import List, Dict, Tuple, Optional
from collections import defaultdict
import json
from utils.text_utils import segment_into_sentences, segment_into_paragraphs


class NarrativeEngine:
    """
    Engine for tracking narrative consistency and story structure
    """
    
    def __init__(self, spacy_model: str = "en_core_web_sm"):
        """Initialize with spaCy model"""
        self.nlp = spacy.load(spacy_model)
        self.knowledge_graph = nx.DiGraph()
        self.entity_mentions = defaultdict(list)
        
    def extract_knowledge_graph(self, text: str) -> Dict:
        """
        Extract entities and relationships to build knowledge graph
        
        Args:
            text: Input text
            
        Returns:
            Dictionary containing graph data
        """
        doc = self.nlp(text)
        
        # Extract entities
        entities = {}
        for ent in doc.ents:
            entity_id = f"{ent.label_}:{ent.text}"
            if entity_id not in entities:
                entities[entity_id] = {
                    'text': ent.text,
                    'label': ent.label_,
                    'mentions': []
                }
            entities[entity_id]['mentions'].append({
                'start': ent.start_char,
                'end': ent.end_char,
                'sentence': ent.sent.text
            })
            
            # Add to graph
            self.knowledge_graph.add_node(
                entity_id,
                label=ent.label_,
                text=ent.text
            )
            
            # Track mentions
            self.entity_mentions[entity_id].append(ent.sent.text)
        
        # Extract relationships (Subject-Verb-Object triples)
        relationships = []
        for sent in doc.sents:
            # Find verb and its subjects/objects
            for token in sent:
                if token.pos_ == 'VERB':
                    subjects = [child for child in token.children if child.dep_ in ('nsubj', 'nsubjpass')]
                    objects = [child for child in token.children if child.dep_ in ('dobj', 'pobj', 'attr')]
                    
                    for subj in subjects:
                        for obj in objects:
                            # Try to find entity matches
                            subj_ent = self._find_entity_for_token(subj, entities)
                            obj_ent = self._find_entity_for_token(obj, entities)
                            
                            if subj_ent and obj_ent:
                                relationship = {
                                    'subject': subj_ent,
                                    'predicate': token.lemma_,
                                    'object': obj_ent,
                                    'sentence': sent.text
                                }
                                relationships.append(relationship)
                                
                                # Add edge to graph
                                self.knowledge_graph.add_edge(
                                    subj_ent,
                                    obj_ent,
                                    predicate=token.lemma_,
                                    sentence=sent.text
                                )
        
        return {
            'entities': entities,
            'relationships': relationships,
            'graph_stats': {
                'num_entities': len(entities),
                'num_relationships': len(relationships),
                'num_nodes': self.knowledge_graph.number_of_nodes(),
                'num_edges': self.knowledge_graph.number_of_edges()
            }
        }
    
    def _find_entity_for_token(self, token, entities: Dict) -> Optional[str]:
        """Find entity ID that contains this token"""
        token_text = token.text.lower()
        for ent_id, ent_data in entities.items():
            if token_text in ent_data['text'].lower():
                return ent_id
        return None
    
    def detect_contradictions(self) -> List[Dict]:
        """
        Detect potential contradictions in the knowledge graph
        
        Returns:
            List of contradiction alerts
        """
        contradictions = []
        
        # Check for conflicting relationships
        for node in self.knowledge_graph.nodes():
            out_edges = list(self.knowledge_graph.out_edges(node, data=True))
            
            # Group by predicate
            predicates = defaultdict(list)
            for _, target, data in out_edges:
                predicates[data['predicate']].append((target, data['sentence']))
            
            # Check for conflicting predicates
            for pred, targets in predicates.items():
                if len(targets) > 1:
                    # Multiple different objects for same predicate
                    unique_targets = set([t[0] for t in targets])
                    if len(unique_targets) > 1:
                        contradictions.append({
                            'type': 'conflicting_relationship',
                            'entity': node,
                            'predicate': pred,
                            'objects': list(unique_targets),
                            'sentences': [t[1] for t in targets],
                            'severity': 'medium'
                        })
        
        return contradictions
    
    def export_graph(self, filepath: str = None) -> Dict:
        """
        Export knowledge graph in JSON format
        
        Args:
            filepath: Optional file path to save
            
        Returns:
            Graph data dictionary
        """
        graph_data = {
            'nodes': [
                {
                    'id': node,
                    'label': data.get('label', ''),
                    'text': data.get('text', '')
                }
                for node, data in self.knowledge_graph.nodes(data=True)
            ],
            'edges': [
                {
                    'source': u,
                    'target': v,
                    'predicate': data.get('predicate', ''),
                    'sentence': data.get('sentence', '')
                }
                for u, v, data in self.knowledge_graph.edges(data=True)
            ]
        }
        
        if filepath:
            with open(filepath, 'w') as f:
                json.dump(graph_data, f, indent=2)
        
        return graph_data


class StructuralEngine:
    """
    Engine for detecting and fixing structural issues in text
    """
    
    def __init__(self, spacy_model: str = "en_core_web_sm"):
        """Initialize with spaCy model"""
        self.nlp = spacy.load(spacy_model)
    
    def detect_passive_voice(self, text: str) -> List[Dict]:
        """
        Detect passive voice constructions
        
        Args:
            text: Input text
            
        Returns:
            List of passive voice detections
        """
        doc = self.nlp(text)
        passive_sentences = []
        
        for sent in doc.sents:
            passive_found = False
            passive_verb = None
            
            for token in sent:
                # Check for passive voice pattern: be + past participle
                if token.dep_ == "auxpass":
                    passive_found = True
                    # Find the main verb
                    for child in token.head.children:
                        if child.dep_ == "nsubjpass":
                            passive_verb = token.head
                            break
                    if passive_verb:
                        break
            
            if passive_found and passive_verb:
                passive_sentences.append({
                    'sentence': sent.text,
                    'start': sent.start_char,
                    'end': sent.end_char,
                    'passive_verb': passive_verb.text,
                    'confidence': 0.85
                })
        
        return passive_sentences
    
    def convert_passive_to_active(self, sentence: str) -> Dict:
        """
        Convert passive voice to active voice
        
        Args:
            sentence: Input sentence in passive voice
            
        Returns:
            Dictionary with original and converted versions
        """
        doc = self.nlp(sentence)
        
        active_sentence = sentence
        conversion_made = False
        explanation = []
        
        for token in doc:
            if token.dep_ == "auxpass":
                # Find subject (nsubjpass) and agent (by phrase)
                subject = None
                agent = None
                main_verb = token.head
                
                for child in token.head.children:
                    if child.dep_ == "nsubjpass":
                        subject = child
                    elif child.dep_ == "agent":
                        # The agent is in "by [agent]"
                        for grandchild in child.children:
                            if grandchild.dep_ == "pobj":
                                agent = grandchild
                
                if subject and agent and main_verb:
                    # Construct active voice: agent + verb + subject
                    verb_text = main_verb.lemma_
                    
                    # Simple conversion (can be enhanced)
                    active_sentence = f"{agent.text} {verb_text} {subject.text}"
                    conversion_made = True
                    
                    explanation.append(
                        f"Converted passive '{sentence}' to active by moving "
                        f"agent '{agent.text}' to subject position"
                    )
                    break
        
        return {
            'original': sentence,
            'converted': active_sentence if conversion_made else sentence,
            'conversion_made': conversion_made,
            'explanation': explanation
        }
    
    def analyze_sentence_structure(self, text: str) -> Dict:
        """
        Analyze overall sentence structure
        
        Args:
            text: Input text
            
        Returns:
            Structure analysis
        """
        doc = self.nlp(text)
        sentences = list(doc.sents)
        
        # Calculate metrics
        sentence_lengths = [len(sent) for sent in sentences]
        
        return {
            'num_sentences': len(sentences),
            'avg_sentence_length': sum(sentence_lengths) / len(sentence_lengths) if sentence_lengths else 0,
            'min_sentence_length': min(sentence_lengths) if sentence_lengths else 0,
            'max_sentence_length': max(sentence_lengths) if sentence_lengths else 0,
            'passive_voice_count': len(self.detect_passive_voice(text)),
            'complexity_score': self._calculate_complexity(doc)
        }
    
    def _calculate_complexity(self, doc) -> float:
        """Calculate text complexity score"""
        # Simple complexity based on dependency depth
        total_depth = 0
        num_tokens = 0
        
        for token in doc:
            depth = 0
            current = token
            while current.head != current:
                depth += 1
                current = current.head
            total_depth += depth
            num_tokens += 1
        
        return total_depth / num_tokens if num_tokens > 0 else 0