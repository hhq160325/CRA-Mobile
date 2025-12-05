import {View, Text, Pressable} from 'react-native';
import {colors} from '../../../theme/colors';
import {scale} from '../../../theme/scale';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type {Review} from '../../../../lib/api';

interface CarReviewsProps {
  reviews: Review[];
  onViewAllReviews: () => void;
}

export default function CarReviews({
  reviews,
  onViewAllReviews,
}: CarReviewsProps) {
  const calculateAverageRating = (): string => {
    if (reviews.length === 0) return '0';
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const renderStars = (rating: number, size: number = 14) => {
    return (
      <View style={{flexDirection: 'row'}}>
        {[...Array(5)].map((_, i) => (
          <Icon
            key={i}
            name="star"
            size={scale(size)}
            color={i < rating ? '#FFB800' : colors.border}
            style={{marginRight: scale(2)}}
          />
        ))}
      </View>
    );
  };

  const getTitle = (review: Review) => {
    if (review.title) return review.title;
    if (!review.comment) return 'Customer Review';
    const lines = review.comment.split('\n');
    return lines[0] || 'Customer Review';
  };

  const getContent = (review: Review) => {
    if (review.content) return review.content;
    if (!review.comment) return '';
    const lines = review.comment.split('\n');
    return (
      lines
        .slice(2)
        .join('\n')
        .replace(/Category:.*$/, '')
        .trim() || review.comment
    );
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.getDate()} ${d.toLocaleString('default', {
      month: 'short',
    })} ${d.getFullYear()}`;
  };

  return (
    <View
      style={{
        backgroundColor: colors.white,
        padding: scale(16),
        marginHorizontal: scale(16),
        borderRadius: scale(12),
        marginBottom: scale(16),
      }}>
      {/* Reviews Header */}
      <View style={{marginBottom: scale(16)}}>
        <Text
          style={{
            fontSize: scale(18),
            fontWeight: '700',
            color: colors.primary,
          }}>
          Customer Reviews
        </Text>
        {reviews.length > 0 && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: scale(4),
            }}>
            {renderStars(Math.round(parseFloat(calculateAverageRating())), 16)}
            <Text
              style={{
                fontSize: scale(14),
                fontWeight: '600',
                color: colors.primary,
                marginLeft: scale(8),
              }}>
              {calculateAverageRating()} ({reviews.length}{' '}
              {reviews.length === 1 ? 'review' : 'reviews'})
            </Text>
          </View>
        )}
      </View>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <View
          style={{
            paddingVertical: scale(40),
            alignItems: 'center',
            backgroundColor: colors.background,
            borderRadius: scale(8),
          }}>
          <Icon name="rate-review" size={scale(48)} color={colors.border} />
          <Text
            style={{
              marginTop: scale(12),
              color: colors.placeholder,
              fontSize: scale(14),
            }}>
            No reviews yet
          </Text>
          <Text
            style={{
              marginTop: scale(4),
              color: colors.placeholder,
              fontSize: scale(12),
            }}>
            Be the first to review this car!
          </Text>
        </View>
      ) : (
        <View>
          {reviews.slice(0, 3).map((review, index) => (
            <View
              key={review.id}
              style={{
                paddingVertical: scale(16),
                borderTopWidth: index > 0 ? 1 : 0,
                borderTopColor: colors.border,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: scale(8),
                }}>
                <View style={{flex: 1}}>
                  <Text
                    style={{
                      fontSize: scale(14),
                      fontWeight: '600',
                      color: colors.primary,
                    }}>
                    {review.userName}
                  </Text>
                  <View style={{marginTop: scale(4)}}>
                    {renderStars(review.rating)}
                  </View>
                </View>
                <Text style={{fontSize: scale(11), color: colors.placeholder}}>
                  {formatDate(review.date)}
                </Text>
              </View>

              <Text
                style={{
                  fontSize: scale(13),
                  fontWeight: '600',
                  color: colors.primary,
                  marginBottom: scale(4),
                }}>
                {getTitle(review)}
              </Text>

              <Text
                style={{
                  fontSize: scale(13),
                  color: colors.placeholder,
                  lineHeight: scale(18),
                }}>
                {getContent(review)}
              </Text>
            </View>
          ))}

          {reviews.length > 3 && (
            <Pressable
              onPress={onViewAllReviews}
              style={{
                marginTop: scale(12),
                paddingVertical: scale(12),
                backgroundColor: colors.background,
                borderRadius: scale(8),
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  color: colors.morentBlue,
                  fontSize: scale(14),
                  fontWeight: '600',
                }}>
                View All {reviews.length} Reviews
              </Text>
              <Icon
                name="arrow-forward"
                size={scale(16)}
                color={colors.morentBlue}
                style={{marginLeft: scale(4)}}
              />
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}
