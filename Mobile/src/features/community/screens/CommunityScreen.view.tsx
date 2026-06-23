import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StatusBar,
} from 'react-native';
import { Search, Bell, Heart, MessageSquare, Eye, Plus } from 'lucide-react-native';
import { styles, COLORS } from './CommunityScreen.styles';

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  time: string;
  category: string;
  likes: number;
  comments: number;
  views: number;
}

export interface CommunityScreenViewProps {
  posts: Post[];
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onWritePost: () => void;
  onPostPress: (postId: string) => void;
}

export default function CommunityScreenView({
  posts,
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onWritePost,
  onPostPress,
}: CommunityScreenViewProps) {
  const renderPostItem = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => onPostPress(item.id)}
      activeOpacity={0.8}
    >
      <View style={styles.postHeader}>
        <View style={styles.authorAvatar}>
          <Text style={styles.authorAvatarText}>{item.author.charAt(0)}</Text>
        </View>
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{item.author}</Text>
          <Text style={styles.postTime}>{item.time}</Text>
        </View>
        <View style={styles.postTag}>
          <Text style={styles.postTagText}>{item.category}</Text>
        </View>
      </View>

      <View style={styles.postBody}>
        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postContent} numberOfLines={2}>
          {item.content}
        </Text>
      </View>

      <View style={styles.postFooter}>
        <View style={styles.footerItem}>
          <Heart size={14} color={COLORS.textSecondary} />
          <Text style={styles.footerText}>{item.likes}</Text>
        </View>
        <View style={styles.footerItem}>
          <MessageSquare size={14} color={COLORS.textSecondary} />
          <Text style={styles.footerText}>{item.comments}</Text>
        </View>
        <View style={styles.footerItem}>
          <Eye size={14} color={COLORS.textSecondary} />
          <Text style={styles.footerText}>{item.views}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>커뮤니티</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color={COLORS.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="관심 있는 여행 글을 검색해보세요"
            placeholderTextColor={COLORS.textTertiary}
            value={searchQuery}
            onChangeText={onSearchChange}
          />
        </View>
      </View>

      {/* Category List */}
      <View style={{ height: 56 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  isActive && styles.categoryChipActive,
                ]}
                onPress={() => onSelectCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isActive && styles.categoryTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Post List */}
      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.postList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80 }}>
            <Text style={{ color: COLORS.textTertiary, fontSize: 15 }}>게시글이 존재하지 않습니다</Text>
          </View>
        }
      />

      {/* Write Button (FAB) */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={onWritePost}
        activeOpacity={0.8}
      >
        <Plus size={24} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}
