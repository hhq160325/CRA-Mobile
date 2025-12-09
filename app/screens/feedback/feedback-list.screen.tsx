'use client';

import { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { NavigatorParamList } from '../../navigators/navigation-route';
import { colors } from '../../theme/colors';
import { scale, verticalScale } from '../../theme/scale';
import Header from '../../components/Header/Header';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { reviewsService, type Review } from '../../../lib/api';
import { styles } from './feedback-list.styles';

export default function FeedbackListScreen() {
  const [ratingFilter] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();

  useEffect(() => {
    loadFeedback();
  }, []);

  const enrichUserData = async (review: Review) => {
    if (!review.userName || review.userName === 'Anonymous') {
      try {
        const { userService } = require('../../../lib/api/services/user.service');
        const userResult = await userService.getUserById(review.userId);

        if (userResult.data) {
          return {
            ...review,
            userName:
              userResult.data.fullname ||
              userResult.data.username ||
              'Anonymous',
          };
        }
      } catch (err) {
        console.log(`Could not fetch user details for ${review.userId}`);
      }
    }
    return review;
  };

  const loadFeedback = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await reviewsService.getAllFeedback();

      if (error) {
        setError(error.message || 'Failed to load feedback');
        return;
      }

      if (data && data.length > 0) {
        const enrichedFeedback = await Promise.all(data.map(enrichUserData));
        setFeedback(enrichedFeedback);
      } else {
        setFeedback(data || []);
      }
    } catch (err) {
      console.error('Error loading feedback:', err);
      setError('Failed to load feedback. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFeedback =
    ratingFilter === null
      ? feedback
      : feedback.filter(f => f.rating >= ratingFilter);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.getDate()} ${d.toLocaleString('default', {
      month: 'short',
    })} ${d.getFullYear()}`;
  };

  const extractTitle = (comment: string) => {
    const lines = comment.split('\n');
    return lines[0] || 'No title';
  };

  const extractMessage = (comment: string) => {
    const lines = comment.split('\n');
    return (
      lines
        .slice(2)
        .join('\n')
        .replace(/Category:.*$/, '')
        .trim() || comment
    );
  };

  const renderStars = (rating: number) => (
    <View style={styles.starsContainer}>
      {[...Array(5)].map((_, i) => (
        <Icon
          key={i}
          name="star"
          size={scale(14)}
          color={i < rating ? '#FFB800' : colors.border}
          style={styles.starIcon}
        />
      ))}
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.morentBlue} />
      <Text style={styles.loadingText}>Loading feedback...</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Icon name="error-outline" size={scale(48)} color={colors.destructive} />
      <Text style={styles.errorText}>{error}</Text>
      <Pressable onPress={loadFeedback} style={styles.retryButton}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </Pressable>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon
        name="inbox"
        size={scale(48)}
        color={colors.border}
        style={styles.emptyIcon}
      />
      <Text style={styles.emptyText}>No feedback found</Text>
    </View>
  );

  const renderFeedbackItem = ({ item }: { item: Review }) => (
    <Pressable
      onPress={() =>
        navigation.navigate('FeedbackDetail' as any, { id: item.id })
      }
      style={styles.feedbackCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderContent}>
          <Text style={styles.cardTitle}>{extractTitle(item.comment)}</Text>
          <Text style={styles.cardUserName}>{item.userName}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        {renderStars(item.rating)}

        <View style={styles.messageContainer}>
          <Text style={styles.messageText} numberOfLines={2}>
            {extractMessage(item.comment)}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>{formatDate(item.date)}</Text>
          <Icon name="arrow-forward" size={scale(16)} color={colors.morentBlue} />
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.filterBar}>
        <Text style={styles.filterTitle}>
          All Feedback ({feedback.length})
        </Text>
        <Pressable onPress={loadFeedback} style={styles.refreshButton}>
          <Icon name="refresh" size={scale(20)} color={colors.morentBlue} />
        </Pressable>
      </View>

      {isLoading ? (
        renderLoadingState()
      ) : error ? (
        renderErrorState()
      ) : (
        <FlatList
          data={filteredFeedback}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState()}
          renderItem={renderFeedbackItem}
        />
      )}
    </View>
  );
}
