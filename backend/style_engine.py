"""
Module 3: Style & Tone Engine
Handles tone detection, style transformation, and explainability (SHAP/LIME)
"""

import numpy as np
from typing import List, Dict, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
import pickle
import os
from nltk.corpus import wordnet
from nltk import pos_tag, word_tokenize
import spacy


class ToneClassifier:
    """
    Classifier for detecting text tone/formality
    """
    
    def __init__(self):
        """Initialize classifier"""
        self.vectorizer = TfidfVectorizer(max_features=500, ngram_range=(1, 2))
        self.classifier = SVC(kernel='linear', probability=True)
        self.is_trained = False
        self.nlp = spacy.load("en_core_web_sm")
        
        # Load or create training data
        self.formal_indicators = [
            'furthermore', 'moreover', 'consequently', 'therefore', 'thus',
            'hereby', 'wherein', 'pursuant', 'regarding', 'respectively'
        ]
        
        self.informal_indicators = [
            'gonna', 'wanna', 'yeah', 'nah', 'cool', 'awesome', 'basically',
            'stuff', 'things', 'kinda', 'sorta', 'dunno', 'gotta'
        ]
    
    def train_simple_classifier(self):
        """
        Train a simple classifier on synthetic data
        (In production, use a real labeled dataset)
        """
        # Generate synthetic training data
        formal_texts = [
            "Furthermore, the research demonstrates significant implications.",
            "The committee hereby approves the aforementioned proposal.",
            "Consequently, we must consider the ramifications of this decision.",
            "The organization is committed to maintaining professional standards.",
            "Therefore, I recommend implementing the proposed solution.",
            "With respect to the matter at hand, we shall proceed accordingly.",
            "The documentation clearly outlines the requisite procedures.",
            "Subsequently, the board will convene to discuss the findings."
        ]
        
        informal_texts = [
            "Yeah, that's pretty cool and stuff.",
            "I'm gonna check it out later, maybe.",
            "This is basically what we need to do.",
            "Nah, I don't think that's gonna work.",
            "It's kinda interesting, you know?",
            "Wanna grab some coffee and talk about it?",
            "That's awesome! Let's do it.",
            "I dunno, seems like a lot of work."
        ]
        
        # Combine data
        texts = formal_texts + informal_texts
        labels = [1] * len(formal_texts) + [0] * len(informal_texts)  # 1=formal, 0=informal
        
        # Train
        X = self.vectorizer.fit_transform(texts)
        self.classifier.fit(X, labels)
        self.is_trained = True
    
    def classify_tone(self, text: str) -> Dict:
        """
        Classify the tone of text
        
        Args:
            text: Input text
            
        Returns:
            Classification results
        """
        if not self.is_trained:
            self.train_simple_classifier()
        
        # Transform text
        X = self.vectorizer.transform([text])
        
        # Predict
        prediction = self.classifier.predict(X)[0]
        probabilities = self.classifier.predict_proba(X)[0]
        
        # Calculate formality score (0-1)
        formality_score = probabilities[1] if len(probabilities) > 1 else float(probabilities[0])
        
        # Determine tone label
        if formality_score > 0.7:
            tone = "very_formal"
        elif formality_score > 0.55:
            tone = "formal"
        elif formality_score > 0.45:
            tone = "neutral"
        elif formality_score > 0.3:
            tone = "informal"
        else:
            tone = "very_informal"
        
        return {
            'tone': tone,
            'formality_score': float(formality_score),
            'confidence': float(max(probabilities)),
            'is_formal': prediction == 1
        }
    
    def get_feature_importance(self, text: str) -> Dict:
        """
        Get word-level importance for classification
        (Simplified version of SHAP)
        
        Args:
            text: Input text
            
        Returns:
            Word importance scores
        """
        if not self.is_trained:
            self.train_simple_classifier()
        
        # Get feature names
        feature_names = self.vectorizer.get_feature_names_out()
        
        # Transform text
        X = self.vectorizer.transform([text])
        
        # Get coefficients (for linear SVM)
        coefficients = self.classifier.coef_[0]
        
        # Get features present in text
        feature_indices = X.nonzero()[1]
        
        # Calculate importance
        word_importance = {}
        for idx in feature_indices:
            feature = feature_names[idx]
            importance = coefficients[idx]
            word_importance[feature] = float(importance)
        
        # Sort by absolute importance
        sorted_importance = sorted(
            word_importance.items(),
            key=lambda x: abs(x[1]),
            reverse=True
        )
        
        return {
            'word_importance': dict(sorted_importance[:20]),
            'top_formal_words': [(w, s) for w, s in sorted_importance if s > 0][:10],
            'top_informal_words': [(w, s) for w, s in sorted_importance if s < 0][:10]
        }


class StyleTransformer:
    """
    Transforms text style using lexical substitution
    """
    
    def __init__(self):
        """Initialize transformer"""
        self.nlp = spacy.load("en_core_web_sm")
        
        # Formality mapping (informal -> formal)
        self.formality_map = {
            'gonna': 'going to',
            'wanna': 'want to',
            'gotta': 'have to',
            'kinda': 'kind of',
            'sorta': 'sort of',
            'yeah': 'yes',
            'nah': 'no',
            'dunno': "don't know",
            'cool': 'excellent',
            'awesome': 'excellent',
            'stuff': 'items',
            'things': 'matters',
            'basically': 'essentially',
            'a lot of': 'numerous',
            'big': 'substantial',
            'get': 'obtain',
            'show': 'demonstrate',
            'use': 'utilize',
            'help': 'assist',
            'buy': 'purchase',
            'start': 'commence',
            'end': 'conclude',
            'kid': 'child',
            'kids': 'children'
        }
        
        # Reverse map for informal conversion
        self.informality_map = {v: k for k, v in self.formality_map.items()}
    
    def transform_formality(self, text: str, target_tone: str = "formal") -> Dict:
        """
        Transform text to target tone
        
        Args:
            text: Input text
            target_tone: Target tone (formal/informal)
            
        Returns:
            Transformed text with explanations
        """
        doc = self.nlp(text)
        
        # Choose mapping direction
        word_map = self.formality_map if target_tone == "formal" else self.informality_map
        
        # Track changes
        changes = []
        transformed_text = text
        
        # Process each token
        for token in doc:
            token_lower = token.text.lower()
            
            if token_lower in word_map:
                replacement = word_map[token_lower]
                
                # Maintain capitalization
                if token.text[0].isupper():
                    replacement = replacement.capitalize()
                
                # Replace in text
                transformed_text = transformed_text.replace(token.text, replacement, 1)
                
                changes.append({
                    'original': token.text,
                    'replacement': replacement,
                    'position': token.idx,
                    'reason': f'Lexical substitution for {target_tone} tone',
                    'pos': token.pos_
                })
        
        # Try WordNet synonyms for remaining words
        if len(changes) < 3:
            additional_changes = self._find_synonyms_for_formality(doc, target_tone)
            changes.extend(additional_changes[:5])  # Add up to 5 more
            
            # Apply additional changes
            for change in additional_changes[:5]:
                transformed_text = transformed_text.replace(
                    change['original'],
                    change['replacement'],
                    1
                )
        
        return {
            'original_text': text,
            'transformed_text': transformed_text,
            'target_tone': target_tone,
            'num_changes': len(changes),
            'changes': changes
        }
    
    def _find_synonyms_for_formality(self, doc, target_tone: str) -> List[Dict]:
        """
        Find synonym replacements using WordNet
        
        Args:
            doc: spaCy doc object
            target_tone: Target tone
            
        Returns:
            List of potential changes
        """
        changes = []
        
        for token in doc:
            # Only process content words
            if token.pos_ not in ['NOUN', 'VERB', 'ADJ', 'ADV']:
                continue
            
            # Skip if already in our maps
            if token.text.lower() in self.formality_map or token.text.lower() in self.informality_map:
                continue
            
            # Get synonyms from WordNet
            synsets = wordnet.synsets(token.text.lower())
            
            if synsets and len(synsets) > 0:
                # Get lemmas from first synset
                lemmas = synsets[0].lemmas()
                
                if len(lemmas) > 1:
                    # Simple heuristic: longer words are more formal
                    sorted_lemmas = sorted(lemmas, key=lambda x: len(x.name()), reverse=(target_tone == "formal"))
                    
                    best_synonym = sorted_lemmas[0].name().replace('_', ' ')
                    
                    if best_synonym.lower() != token.text.lower():
                        changes.append({
                            'original': token.text,
                            'replacement': best_synonym,
                            'position': token.idx,
                            'reason': f'WordNet synonym for {target_tone} tone',
                            'pos': token.pos_
                        })
        
        return changes
    
    def lexical_substitution(self, target_words: List[str], text: str, desired_tone: str = "formal") -> Dict:
        """
        Replace specific target words
        
        Args:
            target_words: Words to replace
            text: Input text
            desired_tone: Desired tone
            
        Returns:
            Substitution results
        """
        word_map = self.formality_map if desired_tone == "formal" else self.informality_map
        
        substitutions = []
        modified_text = text
        
        for word in target_words:
            word_lower = word.lower()
            
            if word_lower in word_map:
                replacement = word_map[word_lower]
                modified_text = modified_text.replace(word, replacement)
                
                substitutions.append({
                    'word': word,
                    'replacement': replacement,
                    'reason': f'Direct mapping for {desired_tone} tone'
                })
        
        return {
            'original_text': text,
            'modified_text': modified_text,
            'substitutions': substitutions,
            'num_substitutions': len(substitutions)
        }