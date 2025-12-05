'use client';

import {useState, useEffect} from 'react';
import {View, Text, FlatList, Pressable, ActivityIndicator} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {NavigatorParamList} from '../../navigators/navigation-route';
import {colors} from '../../theme/colors';
import {scale, verticalScale} from '../../theme/scale';
import Header from '../../components/Header/Header';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {reviewsService, type Review} from '../../../lib/api';

export default function FeedbackListScreen() {
  const [ratingFilter] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const {data, error} = await reviewsService.getAllFeedback();

      if (error) {
        setError(error.message || 'Failed to load feedback');
        return;
      }

      if (data && data.length > 0) {
        const {userService} = require('../../../lib/api/services/user.service');

        const enrichedFeedback = await Promise.all(
          data.map(async review => {
            if (!review.userName || review.userName === 'Anonymous') {
              try {
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
                console.log(
                  `Could not fetch user details for ${review.userId}`,
                );
              }
            }
            return review;
          }),
        );

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

  const renderStars = (rating: number) => {
    return (
      <View style={{flexDirection: 'row', marginVertical: verticalScale(4)}}>
        {[...Array(5)].map((_, i) => (
          <Icon
            key={i}
            name="star"
            size={scale(14)}
            color={i < rating ? '#FFB800' : colors.border}
            style={{marginRight: scale(2)}}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={{flex: 1, backgroundColor: colors.background}}>
      <Header />

      {/* Rating Filter */}
      <View
        style={{
          backgroundColor: colors.white,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          paddingHorizontal: scale(16),
          paddingVertical: scale(12),
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Text
          style={{
            fontSize: scale(14),
            fontWeight: '600',
            color: colors.primary,
          }}>
          All Feedback ({feedback.length})
        </Text>
        <Pressable
          onPress={loadFeedback}
          style={{
            padding: scale(8),
          }}>
          <Icon name="refresh" size={scale(20)} color={colors.morentBlue} />
        </Pressable>
      </View>

      {/* Feedback List */}
      {isLoading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color={colors.morentBlue} />
          <Text
            style={{marginTop: verticalScale(12), color: colors.placeholder}}>
            Loading feedback...
          </Text>
        </View>
      ) : error ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: scale(16),
          }}>
          <Icon
            name="error-outline"
            size={scale(48)}
            color={colors.destructive}
          />
          <Text
            style={{
              marginTop: verticalScale(12),
              color: colors.destructive,
              textAlign: 'center',
            }}>
            {error}
          </Text>
          <Pressable
            onPress={loadFeedback}
            style={{
              marginTop: verticalScale(16),
              paddingHorizontal: scale(24),
              paddingVertical: scale(12),
              backgroundColor: colors.morentBlue,
              borderRadius: scale(8),
            }}>
            <Text style={{color: colors.white, fontWeight: '600'}}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filteredFeedback}
          keyExtractor={item => item.id}
          contentContainerStyle={{padding: scale(16)}}
          ListEmptyComponent={
            <View style={{alignItems: 'center', marginTop: verticalScale(40)}}>
              <Icon
                name="inbox"
                size={scale(48)}
                color={colors.border}
                style={{marginBottom: verticalScale(12)}}
              />
              <Text
                style={{
                  fontSize: scale(16),
                  color: colors.placeholder,
                  fontWeight: '600',
                }}>
                No feedback found
              </Text>
            </View>
          }
          renderItem={({item}) => (
            <Pressable
              onPress={() =>
                navigation.navigate('FeedbackDetail' as any, {id: item.id})
              }
              style={{
                backgroundColor: colors.white,
                borderRadius: scale(12),
                marginBottom: scale(16),
                borderWidth: 1,
                borderColor: colors.border,
                overflow: 'hidden',
              }}>
              {/* Header */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: scale(16),
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}>
                <View style={{flex: 1}}>
                  <Text
                    style={{
                      fontSize: scale(14),
                      fontWeight: '700',
                      color: colors.primary,
                      marginBottom: verticalScale(4),
                    }}>
                    {extractTitle(item.comment)}
                  </Text>
                  <Text
                    style={{
                      fontSize: scale(12),
                      color: colors.placeholder,
                    }}>
                    {item.userName}
                  </Text>
                </View>
              </View>

              {/* Content */}
              <View style={{padding: scale(16)}}>
                {/* Rating */}
                {renderStars(item.rating)}

                {/* Message */}
                <View style={{marginVertical: verticalScale(8)}}>
                  <Text
                    style={{
                      fontSize: scale(13),
                      color: colors.primary,
                      lineHeight: scale(18),
                    }}
                    numberOfLines={2}>
                    {extractMessage(item.comment)}
                  </Text>
                </View>

                {/* Date */}
                <View
                  style={{
                    marginTop: verticalScale(12),
                    paddingTop: verticalScale(12),
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontSize: scale(11),
                      color: colors.placeholder,
                    }}>
                    {formatDate(item.date)}
                  </Text>
                  <Icon
                    name="arrow-forward"
                    size={scale(16)}
                    color={colors.morentBlue}
                  />
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
